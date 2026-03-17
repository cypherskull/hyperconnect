import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';

const router = Router();

// Generate referral code
const generateReferralCode = (name: string): string => {
    const prefix = name.toUpperCase().replace(/\s+/g, '-').slice(0, 10);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HYPER-${prefix}-${suffix}`;
};

// Register
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('name').trim().notEmpty(),
        body('persona').isIn(['Admin', 'Buyer', 'Seller', 'Investor', 'Collaborator', 'Browser']),
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { email, password, name, persona, designation, company, businessEmail, phone, interests } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { personalEmail: email },
            });

            if (existingUser) {
                res.status(400).json({ error: 'User already exists' });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    personalEmail: email,
                    password: hashedPassword,
                    name,
                    persona,
                    designation: designation || '',
                    company: company || '',
                    businessEmail: businessEmail || null,
                    phone: phone || null,
                    referralCode: generateReferralCode(name),
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`,
                },
            });

            // Persist interests if provided
            if (interests) {
                await prisma.userInterests.create({
                    data: {
                        userId: user.id,
                        industries: interests.industry || [],
                        geographies: interests.geography || [],
                        valueChains: interests.valueChain || [],
                        offerings: interests.offering || [],
                    },
                });
            }

            // Auto-create a Seller record so the seller can immediately manage content
            if (persona === 'Seller' && company) {
                await prisma.seller.create({
                    data: {
                        companyName: company,
                        about: '',
                    },
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' } as jwt.SignOptions
            );

            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.personalEmail,
                    personalEmail: user.personalEmail,
                    businessEmail: user.businessEmail,
                    phone: user.phone,
                    persona: user.persona,
                    avatarUrl: user.avatarUrl,
                    referralCode: user.referralCode,
                    interests: interests || null,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { email, password } = req.body;

            // Find user
            const user = await prisma.user.findUnique({
                where: { personalEmail: email },
                include: { interests: true },
            });

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            // Generate token
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' } as jwt.SignOptions
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.personalEmail,
                    persona: user.persona,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                    designation: user.designation,
                    company: user.company,
                    interests: user.interests,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Verify token
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ valid: false });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
            userId: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                personalEmail: true,
                persona: true,
                avatarUrl: true,
                role: true,
            },
        });

        if (!user) {
            res.status(401).json({ valid: false });
            return;
        }

        res.json({ valid: true, user });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

export default router;
