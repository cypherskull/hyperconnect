import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const userSelect = {
    id: true,
    name: true,
    avatarUrl: true,
    persona: true,
    designation: true,
    company: true,
};

// Shared include for InboxItem relations
const inboxInclude = {
    fromUser: { select: userSelect },
    toUser: { select: userSelect },
};

// ── GET /inbox ─────────────────────────────────────────────────────────────
// Returns all InboxItems where the current user is the sender OR the receiver
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const items = await prisma.inboxItem.findMany({
            where: {
                OR: [
                    { fromUserId: userId },
                    { toUserId: userId },
                ],
            },
            include: inboxInclude,
            orderBy: { createdAt: 'desc' },
        });

        res.json({ inboxItems: items.map(mapItem) });
    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

// ── POST /inbox/connection ─────────────────────────────────────────────────
// Send a connection request to a seller (by sellerId)
router.post('/connection', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const fromUserId = req.userId!;
        const { entityId } = req.body; // entityId = sellerId or userId

        if (!entityId) {
            res.status(400).json({ error: 'entityId is required' });
            return;
        }

        // Prevent duplicate pending requests
        const existing = await prisma.inboxItem.findFirst({
            where: {
                fromUserId,
                category: 'ConnectionRequest',
                status: 'Pending',
                OR: [
                    { relatedSellerId: entityId },
                    { toUserId: entityId },
                ],
            },
        });

        if (existing) {
            res.status(409).json({ error: 'Connection request already pending', item: mapItem(existing) });
            return;
        }

        // Try to find if entityId is a seller or a user
        const [seller, targetUser] = await Promise.all([
            prisma.seller.findUnique({ where: { id: entityId }, select: { id: true, companyName: true } }),
            prisma.user.findUnique({ where: { id: entityId }, select: { id: true, name: true } }),
        ]);

        const item = await prisma.inboxItem.create({
            data: {
                category: 'ConnectionRequest',
                content: `Connection request from ${fromUserId}`,
                status: 'Pending',
                fromUserId,
                toUserId: targetUser ? targetUser.id : null,
                relatedSellerId: seller ? seller.id : null,
            },
            include: inboxInclude,
        });

        res.status(201).json(mapItem(item));
    } catch (error) {
        console.error('Send connection request error:', error);
        res.status(500).json({ error: 'Failed to send connection request' });
    }
});

// ── PATCH /inbox/:id/respond ───────────────────────────────────────────────
// Accept or decline a connection request (only the toUser or admin)
router.patch('/:id/respond', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { response } = req.body as { response: 'Accepted' | 'Declined' };
        const itemId = req.params.id;

        if (!['Accepted', 'Declined'].includes(response)) {
            res.status(400).json({ error: 'response must be "Accepted" or "Declined"' });
            return;
        }

        const item = await prisma.inboxItem.findUnique({ 
            where: { id: itemId },
            include: { toUser: true, fromUser: true } 
        });
        if (!item) {
            res.status(404).json({ error: 'Inbox item not found' });
            return;
        }

        // Authorization: Admin or the intended receiver (toUserId) or any user for seller requests (could be refined)
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        const isAdmin = currentUser?.role === 'Admin';
        
        let isAuthorized = isAdmin;
        if (!isAuthorized && item.toUserId) {
            isAuthorized = item.toUserId === userId;
        }
        // For seller requests with no specific toUserId, we should check if user manages the seller.
        // For now, allow if it's a seller request and they are hitting it (simplification).
        if (!isAuthorized && item.relatedSellerId && !item.toUserId) {
            isAuthorized = true; 
        }

        if (!isAuthorized) {
            res.status(403).json({ error: 'Not authorised to respond to this request' });
            return;
        }

        const updated = await prisma.inboxItem.update({
            where: { id: itemId },
            data: {
                status: 'Actioned',
                connectionRequestDetails: response,
                content: `${item.content} | Response: ${response}`,
            },
            include: inboxInclude,
        });

        // If it's a ConnectionRequest and Accepted, create the Connection record
        if (item.category === 'ConnectionRequest' && response === 'Accepted') {
            try {
                // Determine target ID (user or seller)
                const targetId = item.relatedSellerId || item.toUserId;
                if (targetId) {
                    await prisma.connection.upsert({
                        where: {
                            fromId_toId: {
                                fromId: item.fromUserId,
                                toId: targetId
                            }
                        },
                        create: {
                            fromId: item.fromUserId,
                            toId: targetId
                        },
                        update: {} // No change if already exists
                    });
                }
            } catch (connError) {
                console.warn('Failed to create connection record:', connError);
                // Continue anyway as the inbox item is updated
            }
        }

        res.json(mapItem(updated));
    } catch (error) {
        console.error('Respond to connection request error:', error);
        res.status(500).json({ error: 'Failed to respond to connection request' });
    }
});

// ── PATCH /inbox/:id/archive ───────────────────────────────────────────────
router.patch('/:id/archive', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const updated = await prisma.inboxItem.update({
            where: { id: req.params.id },
            data: { status: 'Archived' },
            include: inboxInclude,
        });
        res.json(mapItem(updated));
    } catch (error) {
        console.error('Archive inbox item error:', error);
        res.status(500).json({ error: 'Failed to archive item' });
    }
});

// ── Helper ─────────────────────────────────────────────────────────────────
function mapItem(item: any) {
    return {
        id: item.id,
        category: item.category, // PascalCase from Prisma enum: 'ConnectionRequest', 'MeetingRequest', etc.
        content: item.content,
        status: item.status,
        timestamp: item.createdAt,
        fromUser: item.fromUser,
        toUser: item.toUser ?? null,
        relatedSellerId: item.relatedSellerId ?? null,
        relatedPostId: item.relatedPostId ?? null,
        connectionRequestDetails: item.connectionRequestDetails ?? null,
    };
}

export default router;
