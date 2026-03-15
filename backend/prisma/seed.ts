import { PrismaClient, Persona, Role, SubscriptionPlan, SubscriptionTier, MediaType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============== MOCK DATA (from frontend) ==============

const generateReferralCode = (name: string): string => {
    const prefix = name.toUpperCase().replace(/\s+/g, '-').slice(0, 10);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HYPER-${prefix}-${suffix}`;
};

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.media.deleteMany();
    await prisma.post.deleteMany();
    await prisma.sellerFollow.deleteMany();
    await prisma.sellerLike.deleteMany();
    await prisma.sellerSave.deleteMany();
    await prisma.collateral.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.caseStudy.deleteMany();
    await prisma.solutionCustomField.deleteMany();
    await prisma.solution.deleteMany();
    await prisma.keyImpact.deleteMany();
    await prisma.keyContact.deleteMany();
    await prisma.sellerCustomField.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.userInterests.deleteMany();
    await prisma.inboxItem.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.enterprise.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ============== ENTERPRISES ==============
    console.log('Creating enterprises...');
    const enterprises = await Promise.all([
        prisma.enterprise.create({
            data: {
                id: 'ent-1',
                companyName: 'Innovate Solutions',
                persona: Persona.Seller,
                subscriptionPlan: SubscriptionPlan.Enterprise,
                associationCode: 'INNOV-2024',
                city: 'Los Angeles',
                country: 'USA',
            },
        }),
        prisma.enterprise.create({
            data: {
                id: 'ent-2',
                companyName: 'Global Retail',
                persona: Persona.Buyer,
                subscriptionPlan: SubscriptionPlan.Pro,
                associationCode: 'GLOB-2024',
                city: 'New York',
                country: 'USA',
            },
        }),
    ]);

    // ============== USERS ==============
    console.log('Creating users...');
    const users = await Promise.all([
        // Admin
        prisma.user.create({
            data: {
                id: 'user-1',
                name: 'Admin User',
                avatarUrl: 'https://i.pravatar.cc/150?u=admin',
                persona: Persona.Admin,
                designation: 'Platform Admin',
                company: 'HyperConnect',
                role: Role.Admin,
                personalEmail: 'admin@hyperconnect.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Admin'),
                subscriptionPlan: SubscriptionPlan.Enterprise,
            },
        }),
        // Buyer
        prisma.user.create({
            data: {
                id: 'user-2',
                name: 'Alice Buyer',
                avatarUrl: 'https://i.pravatar.cc/150?u=alice',
                persona: Persona.Buyer,
                designation: 'Procurement Head',
                company: 'Global Retail',
                role: Role.Admin,
                personalEmail: 'alice@globalretail.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Alice'),
                subscriptionPlan: SubscriptionPlan.Pro,
                enterpriseId: 'ent-2',
            },
        }),
        // Seller
        prisma.user.create({
            data: {
                id: 'user-3',
                name: 'Bob Seller',
                avatarUrl: 'https://i.pravatar.cc/150?u=bob',
                persona: Persona.Seller,
                designation: 'CEO',
                company: 'Innovate Solutions',
                role: Role.Admin,
                personalEmail: 'bob@innovate.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Bob'),
                subscriptionPlan: SubscriptionPlan.Enterprise,
                enterpriseId: 'ent-1',
            },
        }),
        // Investor
        prisma.user.create({
            data: {
                id: 'user-4',
                name: 'Charlie Investor',
                avatarUrl: 'https://i.pravatar.cc/150?u=charlie',
                persona: Persona.Investor,
                designation: 'Partner',
                company: 'Venture Capital Inc.',
                role: Role.Member,
                personalEmail: 'charlie@vc.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Charlie'),
                subscriptionPlan: SubscriptionPlan.Pro,
                walletBalance: 25000,
            },
        }),
        // Collaborator
        prisma.user.create({
            data: {
                id: 'user-5',
                name: 'Eve Engineer',
                avatarUrl: 'https://i.pravatar.cc/150?u=eve',
                persona: Persona.Collaborator,
                designation: 'Lead Developer',
                company: 'Innovate Solutions',
                role: Role.Member,
                personalEmail: 'eve@innovate.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Eve'),
                subscriptionPlan: SubscriptionPlan.Pro,
                enterpriseId: 'ent-1',
            },
        }),
        // Browser
        prisma.user.create({
            data: {
                id: 'user-6',
                name: 'Frank Finance',
                avatarUrl: 'https://i.pravatar.cc/150?u=frank',
                persona: Persona.Browser,
                designation: 'Analyst',
                company: 'Independent',
                role: Role.Member,
                personalEmail: 'frank@independent.com',
                isPersonalEmailVerified: true,
                password: hashedPassword,
                referralCode: generateReferralCode('Frank'),
                subscriptionPlan: SubscriptionPlan.Free,
            },
        }),
    ]);

    // Add user interests
    console.log('Adding user interests...');
    await prisma.userInterests.createMany({
        data: [
            { userId: 'user-2', industries: ['Retail', 'Consumer Goods'], geographies: ['North America'], valueChains: ['Sourcing', 'Retail'], offerings: ['Physical Product'] },
            { userId: 'user-3', industries: ['Technology', 'Logistics'], geographies: ['North America', 'Europe', 'Asia'], valueChains: ['Logistics', 'Sourcing'], offerings: ['SaaS Platform'] },
            { userId: 'user-4', industries: ['Technology', 'Finance', 'Healthcare'], geographies: ['North America'], valueChains: ['R&D'], offerings: ['SaaS Platform'] },
        ],
    });

    // ============== SELLERS ==============
    console.log('Creating sellers...');
    const sellers = await Promise.all([
        prisma.seller.create({
            data: {
                id: 'seller-1',
                companyName: 'Innovate Solutions',
                companyLogoUrl: 'https://ui-avatars.com/api/?name=Innovate+Solutions&background=4F46E5&color=fff&size=150',
                about: 'Leading provider of AI-driven supply chain solutions.',
                platformScore: 4.8,
                subscriptionTier: SubscriptionTier.Premium,
                followers: 12500,
                isOpenForInvestment: true,
                city: 'Los Angeles',
                country: 'USA',
                clients: 50,
                turnover: '10 Cr',
                enterpriseId: 'ent-1',
            },
        }),
        prisma.seller.create({
            data: {
                id: 'seller-2',
                companyName: 'GreenPack',
                companyLogoUrl: 'https://ui-avatars.com/api/?name=GreenPack&background=22C55E&color=fff&size=150',
                about: 'Pioneering sustainable packaging for a better future.',
                platformScore: 4.5,
                subscriptionTier: SubscriptionTier.Basic,
                followers: 5300,
                isOpenForInvestment: false,
                city: 'Berlin',
                country: 'Germany',
                clients: 120,
                turnover: '5 Cr',
            },
        }),
        prisma.seller.create({
            data: {
                id: 'seller-3',
                companyName: 'DataWeave Analytics',
                companyLogoUrl: 'https://ui-avatars.com/api/?name=DataWeave&background=3B82F6&color=fff&size=150',
                about: 'Financial analytics powered by next-generation machine learning.',
                platformScore: 4.9,
                subscriptionTier: SubscriptionTier.Premium,
                followers: 25000,
                isOpenForInvestment: true,
                city: 'London',
                country: 'UK',
                clients: 25,
                turnover: '25 Cr',
            },
        }),
        prisma.seller.create({
            data: {
                id: 'seller-4',
                companyName: 'NextGen Robotics',
                companyLogoUrl: 'https://ui-avatars.com/api/?name=NextGen+Robotics&background=EF4444&color=fff&size=150',
                about: 'Building the factories of the future with collaborative robotic arms.',
                platformScore: 4.7,
                subscriptionTier: SubscriptionTier.Premium,
                followers: 18000,
                isOpenForInvestment: true,
                city: 'Tokyo',
                country: 'Japan',
                clients: 40,
                turnover: '50 Cr',
            },
        }),
    ]);

    // ============== KEY IMPACTS ==============
    console.log('Creating key impacts...');
    await prisma.keyImpact.createMany({
        data: [
            { sellerId: 'seller-1', area: 'Efficiency', value: '+30%' },
            { sellerId: 'seller-1', area: 'Cost Saving', value: '-15%' },
            { sellerId: 'seller-2', area: 'Sustainability', value: '-40% Carbon' },
            { sellerId: 'seller-3', area: 'Prediction Accuracy', value: '+7%' },
            { sellerId: 'seller-4', area: 'Productivity', value: '+25%' },
        ],
    });

    // ============== SOLUTIONS ==============
    console.log('Creating solutions...');
    const solutions = await Promise.all([
        prisma.solution.create({
            data: {
                id: 'sol-1',
                name: 'AI-Powered Logistics',
                shortDescription: 'Our flagship product revolutionizes supply chain management using advanced AI.',
                offering: 'SaaS Platform',
                imageUrl: 'https://picsum.photos/seed/sol-1/800/600',
                industries: ['Technology', 'Logistics'],
                valueChains: ['Logistics', 'Sourcing'],
                geographies: ['North America', 'Europe', 'Asia'],
                sellerId: 'seller-1',
                isActive: true,
                status: 'active',
            },
        }),
        prisma.solution.create({
            data: {
                id: 'sol-2',
                name: 'Eco-Friendly Packaging',
                shortDescription: 'Sustainable and biodegradable packaging solutions.',
                offering: 'Physical Product',
                imageUrl: 'https://picsum.photos/seed/sol-2/800/600',
                industries: ['Consumer Goods', 'Manufacturing'],
                valueChains: ['Manufacturing', 'Retail'],
                geographies: ['Europe'],
                sellerId: 'seller-2',
                isActive: true,
                status: 'active',
            },
        }),
        prisma.solution.create({
            data: {
                id: 'sol-3',
                name: 'Predictive Market Analysis',
                shortDescription: 'A SaaS platform that uses machine learning to forecast market trends.',
                offering: 'SaaS Platform',
                imageUrl: 'https://picsum.photos/seed/sol-3/800/600',
                industries: ['Finance', 'Technology'],
                valueChains: ['R&D', 'Marketing'],
                geographies: ['North America', 'Europe'],
                sellerId: 'seller-3',
                isActive: true,
                status: 'active',
            },
        }),
        prisma.solution.create({
            data: {
                id: 'sol-4',
                name: 'Automated Assembly Robots',
                shortDescription: 'High-precision robotic arms for assembly lines.',
                offering: 'Hardware',
                imageUrl: 'https://picsum.photos/seed/sol-4/800/600',
                industries: ['Automotive', 'Industrial'],
                valueChains: ['Manufacturing'],
                geographies: ['Asia', 'North America'],
                sellerId: 'seller-4',
                isActive: true,
                status: 'active',
            },
        }),
    ]);

    // ============== TESTIMONIALS ==============
    console.log('Creating testimonials...');
    await prisma.testimonial.createMany({
        data: [
            { solutionId: 'sol-1', customerName: 'Alice Buyer, Global Retail', quote: 'Innovate Solutions transformed our supply chain. Their AI platform is a game-changer.', quality: 5, time: 4, cost: 5, experience: 5, solutionImpact: 5 },
            { solutionId: 'sol-3', customerName: 'Charlie Investor, Venture Capital Inc.', quote: 'DataWeave provides the most accurate market predictions we have seen.', quality: 5, time: 5, cost: 4, experience: 4, solutionImpact: 5 },
            { solutionId: 'sol-4', customerName: 'Mike Manager, QuickLogistics', quote: 'The automated robots from NextGen have boosted our warehouse throughput by 40%.', quality: 5, time: 5, cost: 4, experience: 5, solutionImpact: 5 },
        ],
    });

    // ============== CASE STUDIES ==============
    console.log('Creating case studies...');
    await prisma.caseStudy.createMany({
        data: [
            { solutionId: 'sol-1', clientName: 'Global Retail', clientNeed: 'Reduce spoilage in fresh produce supply chain by 20%.', solutionApproach: 'Implemented real-time temperature tracking with IoT sensors.', implementationTime: '6 Months', referenceAvailable: true, isClientApproved: true },
            { solutionId: 'sol-4', clientName: 'Major Auto Manufacturer', clientNeed: 'Increase production line speed without compromising safety.', solutionApproach: 'Deployed a fleet of 20 RoboArm-3000 series robots.', implementationTime: '9 Months', referenceAvailable: true, isClientApproved: true },
        ],
    });

    // ============== POSTS ==============
    console.log('Creating posts...');
    const posts = await Promise.all([
        prisma.post.create({
            data: {
                id: 'post-1',
                title: 'We Upgraded Our Logistics AI!',
                content: 'Just pushed a major update to our AI engine, improving prediction accuracy by 15%.',
                sellerId: 'seller-1',
                solutionId: 'sol-1',
                media: {
                    create: [{ type: MediaType.image, url: 'https://picsum.photos/seed/post-1/800/600' }],
                },
            },
        }),
        prisma.post.create({
            data: {
                id: 'post-2',
                title: 'New Biodegradable Material',
                content: 'Our new plant-based material is now available for all packaging needs.',
                sellerId: 'seller-2',
                solutionId: 'sol-2',
                media: {
                    create: [{ type: MediaType.video, url: 'https://www.youtube.com/embed/Ixv_2hrO1rU' }],
                },
            },
        }),
        prisma.post.create({
            data: {
                id: 'post-3',
                title: 'Case Study: Global Investment Bank',
                content: 'Discover how we helped a major bank improve their FOREX trading accuracy.',
                sellerId: 'seller-3',
                solutionId: 'sol-3',
            },
        }),
        prisma.post.create({
            data: {
                id: 'post-4',
                title: 'Robots in Action: See the RoboArm-3000',
                content: 'Check out our latest video showcasing the speed and precision of our robots.',
                sellerId: 'seller-4',
                solutionId: 'sol-4',
                media: {
                    create: [{ type: MediaType.video, url: 'https://www.youtube.com/embed/tF4DML7FIWk' }],
                },
            },
        }),
        prisma.post.create({
            data: {
                id: 'post-5',
                title: 'Early Detection Saves Lives',
                content: 'Our AI diagnostic tool is now being trialed in 5 hospitals.',
                sellerId: 'seller-1',
                solutionId: 'sol-1',
                media: {
                    create: [{ type: MediaType.image, url: 'https://picsum.photos/seed/post-5/800/600' }],
                },
            },
        }),
    ]);

    // Add some likes and comments
    console.log('Adding likes and comments...');
    await prisma.like.createMany({
        data: [
            { userId: 'user-2', postId: 'post-1' },
            { userId: 'user-4', postId: 'post-1' },
            { userId: 'user-2', postId: 'post-3' },
            { userId: 'user-4', postId: 'post-4' },
        ],
    });

    await prisma.comment.createMany({
        data: [
            { userId: 'user-2', postId: 'post-1', content: 'This looks amazing! Can we get a demo?' },
            { userId: 'user-4', postId: 'post-3', content: 'Impressive results. The 7% accuracy gain is significant.' },
        ],
    });

    // Add seller follows
    console.log('Adding seller follows...');
    await prisma.sellerFollow.createMany({
        data: [
            { userId: 'user-2', sellerId: 'seller-1' },
            { userId: 'user-4', sellerId: 'seller-3' },
            { userId: 'user-4', sellerId: 'seller-4' },
        ],
    });

    // ============== EVENTS ==============
    console.log('Creating events...');
    await prisma.event.createMany({
        data: [
            {
                id: 'evt-1',
                title: 'LogiTech Conference 2024',
                date: '2024-09-15',
                time: '10:00 AM',
                venue: 'Virtual',
                virtualLink: 'https://zoom.us',
                geography: ['North America', 'Europe'],
                industry: ['Technology', 'Logistics'],
                valueChain: ['Logistics'],
                speakingOpportunity: true,
                speakingSlots: 2,
                delegateRegistration: 'Free',
                delegateSlots: 50,
                isPublic: true,
                programManagerId: 'user-3', // Bob Seller
                sellerId: 'seller-1',
                solutionId: 'sol-1'
            },
            {
                id: 'evt-2',
                title: 'Private Supply Chain Mixer',
                date: '2024-10-10',
                time: '06:00 PM',
                venue: 'London, UK',
                geography: ['Europe'],
                industry: ['Retail'],
                valueChain: ['Retail'],
                speakingOpportunity: false,
                speakingSlots: 0,
                delegateRegistration: 'Paid',
                delegateSlots: 10,
                isPublic: false,
                programManagerId: 'user-3',
                sellerId: 'seller-1',
                solutionId: 'sol-1'
            },
        ]
    });

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${enterprises.length} enterprises`);
    console.log(`Created ${users.length} users`);
    console.log(`Created ${sellers.length} sellers`);
    console.log(`Created ${solutions.length} solutions`);
    console.log(`Created ${posts.length} posts`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
