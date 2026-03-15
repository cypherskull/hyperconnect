import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                interests: true,
                enterprise: true,
                followedSellers: { include: { seller: true } },
                savedSellers: { include: { seller: true } },
                likedSellers: { include: { seller: true } },
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { password, followedSellers, savedSellers, likedSellers, ...userData } = user;
        res.json({
            ...userData,
            followedSellers: followedSellers.map((fs: any) => fs.sellerId),
            savedSellers: savedSellers.map((ss: any) => ss.sellerId),
            likedSellers: likedSellers.map((ls: any) => ls.sellerId),
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                persona: true,
                designation: true,
                company: true,
                interests: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, designation, company, avatarUrl, wantsEmailNotifications, interests } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(name && { name }),
                ...(designation && { designation }),
                ...(company && { company }),
                ...(avatarUrl && { avatarUrl }),
                ...(typeof wantsEmailNotifications === 'boolean' && { wantsEmailNotifications }),
            },
        });

        // Update interests if provided
        if (interests) {
            await prisma.userInterests.upsert({
                where: { userId: req.userId! },
                create: {
                    userId: req.userId!,
                    industries: interests.industries || [],
                    geographies: interests.geographies || [],
                    valueChains: interests.valueChains || [],
                    offerings: interests.offerings || [],
                },
                update: {
                    industries: interests.industries || [],
                    geographies: interests.geographies || [],
                    valueChains: interests.valueChains || [],
                    offerings: interests.offerings || [],
                },
            });
        }

        const { password, ...userData } = updatedUser;
        res.json(userData);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// List all users (admin only or for connections)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, persona } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = persona ? { persona: persona as any } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                    persona: true,
                    designation: true,
                    company: true,
                    interests: true,
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router;
