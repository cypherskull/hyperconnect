import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// List posts (paginated, with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, sellerId, solutionId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const userId = req.userId; // may be undefined if not authenticated

        const where: any = {};
        if (sellerId) where.sellerId = sellerId;
        if (solutionId) where.solutionId = solutionId;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: { id: true, name: true, avatarUrl: true, persona: true },
                    },
                    seller: {
                        select: { id: true, companyName: true, companyLogoUrl: true },
                    },
                    solution: {
                        select: { id: true, name: true },
                    },
                    media: true,
                    comments: {
                        include: {
                            user: {
                                select: { id: true, name: true, avatarUrl: true, persona: true, designation: true, company: true },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                    _count: { select: { likes: true, bookmarks: true } },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.post.count({ where }),
        ]);

        // Fetch current user's likes and bookmarks in one query
        let userLikedPostIds = new Set<string>();
        let userBookmarkedPostIds = new Set<string>();
        if (userId) {
            const postIds = posts.map((p: any) => p.id);
            const [userLikes, userBookmarks] = await Promise.all([
                prisma.like.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true } }),
                prisma.bookmark.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true } }),
            ]);
            userLikedPostIds = new Set(userLikes.map((l: any) => l.postId));
            userBookmarkedPostIds = new Set(userBookmarks.map((b: any) => b.postId));
        }

        res.json({
            posts: posts.map((post: any) => ({
                ...post,
                likes: post._count.likes,
                bookmarks: post._count.bookmarks,
                isLiked: userLikedPostIds.has(post.id),
                isBookmarked: userBookmarkedPostIds.has(post.id),
                comments: post.comments.map((c: any) => ({
                    ...c,
                    timestamp: c.createdAt,
                    user: { ...c.user, persona: c.user.persona || 'Browser' }
                })),
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('List posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});


// Get single post
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
            include: {
                author: {
                    select: { id: true, name: true, avatarUrl: true, persona: true },
                },
                seller: {
                    select: { id: true, companyName: true, companyLogoUrl: true },
                },
                solution: {
                    select: { id: true, name: true },
                },
                media: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatarUrl: true, persona: true, designation: true, company: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                _count: { select: { likes: true, bookmarks: true } },
            },
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        let isLiked = false;
        let isBookmarked = false;
        if (userId) {
            const [likeRecord, bookmarkRecord] = await Promise.all([
                prisma.like.findUnique({ where: { userId_postId: { userId, postId: post.id } } }),
                prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId: post.id } } }),
            ]);
            isLiked = !!likeRecord;
            isBookmarked = !!bookmarkRecord;
        }

        res.json({
            ...post,
            likes: post._count.likes,
            bookmarks: post._count.bookmarks,
            isLiked,
            isBookmarked,
            comments: post.comments.map((c: any) => ({
                ...c,
                timestamp: c.createdAt,
                user: { ...c.user, persona: c.user.persona || 'Browser' }
            })),
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create post
router.post(
    '/',
    authenticate,
    [
        body('title').trim().notEmpty(),
        body('content').optional(),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { title, content, sellerId, solutionId, media } = req.body;

            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    authorId: req.userId,
                    sellerId,
                    solutionId,
                    media: media ? {
                        create: media.map((m: { type: string; url: string }) => ({
                            type: m.type as any,
                            url: m.url,
                        })),
                    } : undefined,
                },
                include: {
                    author: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                    media: true,
                },
            });

            res.status(201).json(post);
        } catch (error) {
            console.error('Create post error:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    }
);

// Update post
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if (post.authorId !== req.userId) {
            res.status(403).json({ error: 'Not authorized to edit this post' });
            return;
        }

        const { title, content } = req.body;

        const updatedPost = await prisma.post.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
            },
        });

        res.json(updatedPost);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if (post.authorId !== req.userId && req.userRole !== 'Admin') {
            res.status(403).json({ error: 'Not authorized to delete this post' });
            return;
        }

        await prisma.post.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Like/unlike post
router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        const userId = req.userId!;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId },
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id },
            });
            res.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: { userId, postId },
            });
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Failed to like/unlike post' });
    }
});

// Bookmark/unbookmark post
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        const userId = req.userId!;

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_postId: { userId, postId },
            },
        });

        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: { id: existingBookmark.id },
            });
            res.json({ bookmarked: false });
        } else {
            await prisma.bookmark.create({
                data: { userId, postId },
            });
            res.json({ bookmarked: true });
        }
    } catch (error) {
        console.error('Bookmark post error:', error);
        res.status(500).json({ error: 'Failed to bookmark/unbookmark post' });
    }
});

// Add comment
router.post(
    '/:id/comments',
    authenticate,
    [body('content').trim().notEmpty()],
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const comment = await prisma.comment.create({
                data: {
                    content: req.body.content,
                    userId: req.userId!,
                    postId: req.params.id,
                },
                include: {
                    user: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                },
            });

            res.status(201).json(comment);
        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    }
);

// Delete comment
router.delete('/:postId/comments/:commentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: req.params.commentId },
        });

        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        if (comment.userId !== req.userId && req.userRole !== 'Admin') {
            res.status(403).json({ error: 'Not authorized to delete this comment' });
            return;
        }

        await prisma.comment.delete({
            where: { id: req.params.commentId },
        });

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;
