import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// List sellers (paginated, with filters)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            page = 1,
            limit = 10,
            industry,
            geography,
            offering,
            isOpenForInvestment,
            search,
        } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (isOpenForInvestment === 'true') {
            where.isOpenForInvestment = true;
        }

        if (search) {
            where.OR = [
                { companyName: { contains: search as string, mode: 'insensitive' } },
                { about: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [sellers, total] = await Promise.all([
            prisma.seller.findMany({
                where,
                include: {
                    solutions: {
                        select: {
                            id: true,
                            name: true,
                            offering: true,
                            industries: true,
                            geographies: true,
                            status: true,
                        },
                    },
                    events: true,
                    keyImpacts: true,
                    _count: {
                        select: {
                            posts: true,
                            followedBy: true,
                            likedBy: true,
                        }
                    },
                },
                skip,
                take: Number(limit),
                orderBy: { platformScore: 'desc' },
            }),
            prisma.seller.count({ where }),
        ]);

        res.json({
            sellers: sellers.map((seller: any) => ({
                ...seller,
                postsCount: seller._count.posts,
                followersCount: seller._count.followedBy,
                likesCount: seller._count.likedBy,
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('List sellers error:', error);
        res.status(500).json({ error: 'Failed to fetch sellers' });
    }
});

// Get single seller with full details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const seller = await prisma.seller.findUnique({
            where: { id: req.params.id },
            include: {
                solutions: {
                    include: {
                        customFields: true,
                        caseStudies: true,
                        testimonials: true,
                        collaterals: true,
                        events: true,
                    },
                },
                keyImpacts: true,
                keyContacts: true,
                customFields: true,
                posts: {
                    include: {
                        media: true,
                        _count: { select: { likes: true, comments: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                events: true,
                _count: {
                    select: {
                        posts: true,
                        followedBy: true,
                        likedBy: true,
                        savedBy: true,
                    }
                },
            },
        });

        if (!seller) {
            res.status(404).json({ error: 'Seller not found' });
            return;
        }

        res.json({
            ...seller,
            postsCount: seller._count?.posts || 0,
            followersCount: seller._count?.followedBy || 0,
            likesCount: seller._count?.likedBy || 0,
            savesCount: seller._count?.savedBy || 0,
        });
    } catch (error) {
        console.error('Get seller error:', error);
        res.status(500).json({ error: 'Failed to fetch seller' });
    }
});

// Follow/unfollow seller
router.post('/:id/follow', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const userId = req.userId!;

        const existingFollow = await prisma.sellerFollow.findUnique({
            where: {
                userId_sellerId: { userId, sellerId },
            },
        });

        if (existingFollow) {
            await prisma.sellerFollow.delete({
                where: { id: existingFollow.id },
            });
        } else {
            await prisma.sellerFollow.create({
                data: { userId, sellerId },
            });
        }

        // Fetch updated user and seller
        const [user, seller] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                include: {
                    interests: true,
                    followedSellers: true,
                },
            }),
            prisma.seller.findUnique({
                where: { id: sellerId },
                include: {
                    solutions: true,
                    _count: { select: { followedBy: true, likedBy: true } }
                }
            })
        ]);

        res.json({
            user: {
                ...user,
                followedSellers: (user as any).followedSellers.map((fs: any) => fs.sellerId)
            },
            seller: {
                ...seller,
                followersCount: (seller as any)._count.followedBy,
                likesCount: (seller as any)._count.likedBy,
            }
        });
    } catch (error) {
        console.error('Follow seller error:', error);
        res.status(500).json({ error: 'Failed to follow/unfollow seller' });
    }
});

// Like/unlike seller
router.post('/:id/like', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const userId = req.userId!;

        const existingLike = await prisma.sellerLike.findUnique({
            where: {
                userId_sellerId: { userId, sellerId },
            },
        });

        if (existingLike) {
            await prisma.sellerLike.delete({
                where: { id: existingLike.id },
            });
            res.json({ liked: false });
        } else {
            await prisma.sellerLike.create({
                data: { userId, sellerId },
            });
            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Like seller error:', error);
        res.status(500).json({ error: 'Failed to like/unlike seller' });
    }
});

// Save/unsave seller
router.post('/:id/save', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const userId = req.userId!;

        const existingSave = await prisma.sellerSave.findUnique({
            where: {
                userId_sellerId: { userId, sellerId },
            },
        });

        if (existingSave) {
            await prisma.sellerSave.delete({
                where: { id: existingSave.id },
            });
            res.json({ saved: false });
        } else {
            await prisma.sellerSave.create({
                data: { userId, sellerId },
            });
            res.json({ saved: true });
        }
    } catch (error) {
        console.error('Save seller error:', error);
        res.status(500).json({ error: 'Failed to save/unsave seller' });
    }
});

// Get seller's solutions
router.get('/:id/solutions', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const solutions = await prisma.solution.findMany({
            where: { sellerId: req.params.id },
            include: {
                customFields: true,
                caseStudies: true,
                testimonials: true,
                collaterals: true,
            },
        });

        res.json(solutions);
    } catch (error) {
        console.error('Get solutions error:', error);
        res.status(500).json({ error: 'Failed to fetch solutions' });
    }
});

// Send a message to a seller (creates an InboxItem of category Message)
router.post('/:id/message', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const fromUserId = req.userId!;
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Message content is required' });
            return;
        }

        // Find the seller owner (any user with matching company) or leave toUser null
        const seller = await prisma.seller.findUnique({ where: { id: sellerId }, select: { companyName: true } });

        const item = await prisma.inboxItem.create({
            data: {
                category: 'Message',
                content: content.trim(),
                status: 'Pending',
                fromUserId,
                relatedSellerId: sellerId,
            },
            include: {
                fromUser: { select: { id: true, name: true, avatarUrl: true, persona: true, designation: true, company: true } },
                toUser: { select: { id: true, name: true, avatarUrl: true, persona: true, designation: true, company: true } },
            }
        });

        res.status(201).json({ ...item, relatedSeller: seller });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Request a meeting with a seller (creates an InboxItem of category MeetingRequest)
router.post('/:id/meeting', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const fromUserId = req.userId!;
        const { proposedTime, message } = req.body;

        if (!proposedTime) {
            res.status(400).json({ error: 'Proposed time is required' });
            return;
        }

        const seller = await prisma.seller.findUnique({ where: { id: sellerId }, select: { companyName: true } });

        const content = message
            ? `Proposed time: ${proposedTime}\n\n${message}`
            : `Proposed time: ${proposedTime}`;

        const item = await prisma.inboxItem.create({
            data: {
                category: 'MeetingRequest',
                content,
                status: 'Pending',
                fromUserId,
                relatedSellerId: sellerId,
            },
            include: {
                fromUser: { select: { id: true, name: true, avatarUrl: true, persona: true, designation: true, company: true } },
            }
        });

        res.status(201).json({ ...item, relatedSeller: seller });
    } catch (error) {
        console.error('Meeting request error:', error);
        res.status(500).json({ error: 'Failed to send meeting request' });
    }
});

// Update Due Diligence Data
router.put('/:id/due-diligence', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const { data } = req.body;

        const updatedSeller = await prisma.seller.update({
            where: { id: sellerId },
            data: { dueDiligence: data },
        });

        res.json(updatedSeller.dueDiligence);
    } catch (error) {
        console.error('Update Due Diligence error:', error);
        res.status(500).json({ error: 'Failed to update due diligence data' });
    }
});

// Update Solutions (and their Events)
router.put('/:id/solutions', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const { solutions } = req.body;

        for (const sol of solutions) {
            if (sol.events && Array.isArray(sol.events)) {
                for (const ev of sol.events) {
                    await prisma.event.upsert({
                        where: { id: ev.id },
                        update: {
                            title: ev.title, date: ev.date, time: ev.time, venue: ev.venue, geography: ev.geography, industry: ev.industry, valueChain: ev.valueChain, isPublic: ev.isPublic, delegateRegistration: ev.delegateRegistration || 'None', speakingOpportunity: ev.speakingOpportunity
                        },
                        create: {
                            id: ev.id,
                            title: ev.title, date: ev.date, time: ev.time, venue: ev.venue, geography: ev.geography, industry: ev.industry, valueChain: ev.valueChain, isPublic: ev.isPublic, delegateRegistration: ev.delegateRegistration || 'None', speakingOpportunity: ev.speakingOpportunity || false,
                            sellerId, solutionId: sol.id
                        }
                    });
                }
            }
        }

        const updatedSeller = await prisma.seller.findUnique({
            where: { id: sellerId },
            include: {
                solutions: {
                    include: {
                        customFields: true,
                        caseStudies: true,
                        testimonials: true,
                        collaterals: true,
                        events: true,
                    },
                },
                events: true
            }
        });

        res.json(updatedSeller);
    } catch (error) {
        console.error('Update Solutions error:', error);
        res.status(500).json({ error: 'Failed to update solutions' });
    }
});

// Toggle Investment Status
router.put('/:id/investment-status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sellerId = req.params.id;
        const { isOpenForInvestment } = req.body;

        const updatedSeller = await prisma.seller.update({
            where: { id: sellerId },
            data: { isOpenForInvestment },
        });

        res.json({ isOpenForInvestment: updatedSeller.isOpenForInvestment });
    } catch (error) {
        console.error('Update Investment Status error:', error);
        res.status(500).json({ error: 'Failed to update investment status' });
    }
});

// Update an event
router.put('/:id/events/:eventId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { eventId } = req.params;
        const eventData = req.body;

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: eventData
        });

        res.json(updatedEvent);
    } catch (error) {
        console.error('Update Event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

export default router;
