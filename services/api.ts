

import { User, Persona, Seller, Post, Solution, InboxItem, AccessConfig, FeatureKey, Enterprise, SubscriptionPlan, CaseStudy, Testimonial, Collateral, CollateralType, Podcast, Event, Enquiry, MeetingRequest, MonetizationRule, DueDiligenceData } from '../types';

export const mockFilterOptions = {
    valueChains: ['Design', 'Sourcing', 'Manufacturing', 'Logistics', 'Marketing', 'Retail', 'R&D', 'After-Sales Support'],
    geographies: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia', 'Middle East'],
    industries: ['Technology', 'Healthcare', 'Finance', 'Automotive', 'Consumer Goods', 'Energy', 'Industrial', 'Agriculture', 'Logistics', 'Retail'],
    offerings: ['SaaS Platform', 'Physical Product', 'Software', 'Hardware', 'Service'],
};

export const parseTurnover = (turnover: string): number => {
    const value = parseFloat(turnover.replace(/[^0-9.]/g, ''));
    if (turnover.toLowerCase().includes('cr')) {
        return value * 10000000;
    }
    if (turnover.toLowerCase().includes('lakh')) {
        return value * 100000;
    }
    return value;
}

// --- RECONSTRUCTED & EXPANDED MOCK DATA ---

const users: User[] = [
    // Platform Admin
    { id: 'user-1', name: 'Admin User', avatarUrl: 'https://i.pravatar.cc/150?u=admin', persona: 'Admin', designation: 'Platform Admin', company: 'HyperConnect', role: 'Admin', personalEmail: 'admin@personal.com', isPersonalEmailVerified: true, businessEmail: 'admin@hyperconnect.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', subscriptionPlan: 'Enterprise', referralCode: 'HYPER-ADMIN123', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [], paymentMethods: [], preferredPaymentMethodId: undefined },
    
    // Enterprise: Global Retail (Buyer)
    { id: 'user-2', name: 'Alice Buyer', avatarUrl: 'https://i.pravatar.cc/150?u=alice', persona: 'Buyer', designation: 'Procurement Head', company: 'Global Retail', role: 'Admin', personalEmail: 'alice@personal.com', isPersonalEmailVerified: true, businessEmail: 'alice@globalretail.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, connections: ['seller-1', 'seller-4', 'seller-5'], savedSellers: ['seller-2', 'seller-3'], password: 'password123', enterpriseId: 'ent-2', referralCode: 'HYPER-ALICE456', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [{ id: 'txn-join-2', date: '2023-01-01T10:00:00Z', description: 'Platform Joining Fee', amount: -99, status: 'paid' }], paymentMethods: [{ id: 'pm-1', type: 'Card', provider: 'Visa', last4: '1234' }, { id: 'pm-2', type: 'Netbanking', provider: 'HDFC Bank', last4: '5678' }], preferredPaymentMethodId: 'pm-1' },

    // Enterprise: Innovate Solutions (Seller)
    { id: 'user-3', name: 'Bob Seller', avatarUrl: 'https://i.pravatar.cc/150?u=bob', persona: 'Seller', designation: 'CEO', company: 'Innovate Solutions', role: 'Admin', personalEmail: 'bob@personal.com', isPersonalEmailVerified: true, businessEmail: 'bob@innovate.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, connections: ['seller-2'], password: 'password123', enterpriseId: 'ent-1', referralCode: 'HYPER-BOB789', referrals: [], monthlyReferralEarnings: [], isDormant: false, messageCredits: { remaining: 10, resetsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()}, transactionHistory: [{ id: 'txn-join-3', date: '2023-01-01T10:00:00Z', description: 'Platform Joining Fee', amount: -4999, status: 'paid' }], paymentMethods: [{ id: 'pm-3', type: 'Card', provider: 'Mastercard', last4: '9876' }], preferredPaymentMethodId: 'pm-3' },
    { id: 'user-5', name: 'Eve Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=eve', persona: 'Collaborator', designation: 'Lead Developer', company: 'Innovate Solutions', role: 'Member', personalEmail: 'eve@personal.com', isPersonalEmailVerified: true, businessEmail: 'eve@innovate.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', enterpriseId: 'ent-1', referralCode: 'HYPER-EVE101', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [], paymentMethods: [], preferredPaymentMethodId: undefined },

    // Independent Users
    { id: 'user-4', name: 'Charlie Investor', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', persona: 'Investor', designation: 'Partner', company: 'Venture Capital Inc.', role: 'Member', personalEmail: 'charlie@personal.com', isPersonalEmailVerified: true, businessEmail: 'charlie@vc.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', subscriptionPlan: 'Pro', walletBalance: 25000, transactionHistory: [{id: 't1', date: new Date().toISOString(), description: 'Initial Balance', amount: 25000, status: 'paid'}], connections: ['seller-3', 'seller-4', 'seller-6'], savedSellers: ['seller-1', 'seller-7', 'seller-8'], referralCode: 'HYPER-CHARLIE112', referrals: [], monthlyReferralEarnings: [], isDormant: false, paymentMethods: [], preferredPaymentMethodId: undefined },
    { id: 'user-6', name: 'Frank Finance', avatarUrl: 'https://i.pravatar.cc/150?u=frank', persona: 'Browser', designation: 'Analyst', company: 'Independent', role: 'Member', personalEmail: 'frank@personal.com', isPersonalEmailVerified: true, businessEmail: 'frank@independent.com', isBusinessEmailVerified: true, wantsEmailNotifications: false, password: 'password123', subscriptionPlan: 'Free', referralCode: 'HYPER-FRANK131', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [], paymentMethods: [], preferredPaymentMethodId: undefined },

    // User with an invite
    { id: 'user-7', name: 'Grace Growth', avatarUrl: 'https://i.pravatar.cc/150?u=grace', persona: 'Buyer', designation: 'Marketing Manager', company: 'Startup Co', role: 'Member', personalEmail: 'grace@personal.com', isPersonalEmailVerified: true, businessEmail: 'grace@startup.co', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', enterpriseInvite: { enterpriseId: 'ent-2', enterpriseName: 'Global Retail' }, subscriptionPlan: 'Basic', walletBalance: 5000, transactionHistory: [], referralCode: 'HYPER-GRACE415', referrals: [], monthlyReferralEarnings: [], isDormant: false, paymentMethods: [], preferredPaymentMethodId: undefined },

    // User with a pending join request
    { id: 'user-8', name: 'Harry HR', avatarUrl: 'https://i.pravatar.cc/150?u=harry', persona: 'Collaborator', designation: 'HR Manager', company: 'People First', role: 'Member', personalEmail: 'harry@personal.com', isPersonalEmailVerified: true, businessEmail: 'harry@peoplefirst.com', isBusinessEmailVerified: true, password: 'password123', wantsEmailNotifications: true, referralCode: 'HYPER-HARRY161', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [], paymentMethods: [], preferredPaymentMethodId: undefined },
    
    // Additional users for engagement
    { id: 'user-9', name: 'Diana Developer', avatarUrl: 'https://i.pravatar.cc/150?u=diana', persona: 'Collaborator', designation: 'Software Engineer', company: 'Code Crafters', role: 'Member', personalEmail: 'diana@personal.com', isPersonalEmailVerified: true, businessEmail: 'diana@codecrafters.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', subscriptionPlan: 'Free', referralCode: 'HYPER-DIANA718', referrals: [], monthlyReferralEarnings: [], isDormant: false, transactionHistory: [{ id: 'txn-join-9', date: '2023-01-01T10:00:00Z', description: 'Platform Joining Fee', amount: -99, status: 'paid' }], paymentMethods: [], preferredPaymentMethodId: undefined },
    { id: 'user-10', name: 'Mike Manager', avatarUrl: 'https://i.pravatar.cc/150?u=mike', persona: 'Buyer', designation: 'Operations Manager', company: 'QuickLogistics', role: 'Member', personalEmail: 'mike@personal.com', isPersonalEmailVerified: true, businessEmail: 'mike@quicklogistics.com', isBusinessEmailVerified: true, wantsEmailNotifications: true, password: 'password123', subscriptionPlan: 'Pro', walletBalance: 12000, transactionHistory: [], connections: ['seller-1', 'seller-7'], referralCode: 'HYPER-MIKE192', referrals: [], monthlyReferralEarnings: [], isDormant: false, paymentMethods: [], preferredPaymentMethodId: undefined }
];

export let mockUsers = users;

// --- CONTENT ITEMS (Testimonials, Case Studies, etc.) --- //

const testimonials: Testimonial[] = [
    { id: 'test-1', customerName: 'Alice Buyer, Global Retail', quote: 'Innovate Solutions transformed our supply chain. Their AI platform is a game-changer for efficiency and cost-savings.', videoUrl: 'https://youtube.com', scores: { quality: 5, time: 4, cost: 5, experience: 5, solutionImpact: 5 } },
    { id: 'test-2', customerName: 'Charlie Investor, Venture Capital Inc.', quote: 'DataWeave provides the most accurate market predictions we have seen. An essential tool for any serious investor.', scores: { quality: 5, time: 5, cost: 4, experience: 4, solutionImpact: 5 } },
    { id: 'test-3', customerName: 'Mike Manager, QuickLogistics', quote: 'The automated robots from NextGen have boosted our warehouse throughput by 40%. Incredible performance and reliability.', scores: { quality: 5, time: 5, cost: 4, experience: 5, solutionImpact: 5 } },
    { id: 'test-4', customerName: 'Alice Buyer, Global Retail', quote: 'PureSource Organics has an incredibly transparent and reliable supply chain. Their quality is unmatched.', scores: { quality: 5, time: 4, cost: 3, experience: 5, solutionImpact: 4 } },
];

const caseStudies: CaseStudy[] = [
    { id: 'cs-1', clientName: 'Global Retail', clientNeed: '<p>Needed to reduce spoilage in their fresh produce supply chain by 20%.</p>', solutionApproach: '<p>Implemented a real-time temperature and humidity tracking system using IoT sensors, integrated with the AI-Powered Logistics platform.</p>', solutionDescription: '<p>Our platform analyzed the incoming data to predict potential spoilage events and automatically rerouted shipments to closer distribution centers, optimizing delivery times.</p>', implementationTime: '6 Months', referenceAvailable: true, isClientApproved: true, customFields: [] },
    { id: 'cs-2', clientName: 'Major Auto Manufacturer', clientNeed: '<p>Increase production line speed without compromising on safety or quality for a new EV model.</p>', solutionApproach: '<p>Deployed a fleet of 20 RoboArm-3000 series robots for chassis assembly and battery pack installation.</p>', solutionDescription: '<p>The robots were programmed with advanced computer vision to ensure precise placement, and worked collaboratively with human teams for quality assurance checks. The result was a 25% increase in units produced per hour.</p>', implementationTime: '9 Months', referenceAvailable: true, isClientApproved: true, customFields: [{ id: 'cscf-1', label: 'Productivity Gain', content: '<h3>+25% Units/Hour</h3>' }] },
    { id: 'cs-3', clientName: 'Global Investment Bank', clientNeed: '<p>Required a tool to predict currency fluctuations with higher accuracy than existing models to inform their FOREX trading strategy.</p>', solutionApproach: '<p>Utilized the DataWeave platform to analyze historical market data, news sentiment, and macroeconomic indicators in real-time.</p>', solutionDescription: '<p>The platform’s deep learning models identified non-obvious correlations, leading to a 7% improvement in short-term prediction accuracy and a significant boost in trading profits.</p>', implementationTime: '4 Months', referenceAvailable: false, isClientApproved: true, customFields: [] },
];

const collaterals: Collateral[] = [
    { id: 'coll-1', name: 'AI Logistics Whitepaper', fileName: 'AI_Logistics_Q3.pdf', type: CollateralType.PDF },
    { id: 'coll-2', name: 'Eco-Packaging Brochure', fileName: 'GreenPack_Brochure.pdf', type: CollateralType.PDF },
    { id: 'coll-3', name: 'Market Analysis Deck', fileName: 'DataWeave_Platform.pptx', type: CollateralType.Presentation },
    { id: 'coll-4', name: 'RoboArm-3000 Spec Sheet', fileName: 'RoboArm3000.pdf', type: CollateralType.PDF },
    { id: 'coll-5', name: 'Organic Certification', fileName: 'PureSource_Cert.png', type: CollateralType.Image },
    { id: 'coll-6', name: 'Diagnostic Imaging Results', fileName: 'QuantumLeap_Results.png', type: CollateralType.Image },
    { id: 'coll-7', name: 'Delivery Drone Specs', fileName: 'UMC_Drone_X1.pdf', type: CollateralType.PDF },
];

const podcasts: Podcast[] = [
    { id: 'pod-1', title: 'The Future of Supply Chains', narrative: 'Our CEO Bob Seller discusses the impact of AI on global logistics.' },
];
const events: Event[] = [
    { id: 'evt-1', title: 'LogiTech Conference 2024', date: '2024-09-15', time: '10:00 AM', venue: 'Virtual', virtualLink: 'https://zoom.us' },
];

// --- SOLUTIONS --- //
export const mockSolutions: Solution[] = [
     { id: 'sol-1', name: 'AI-Powered Logistics', shortDescription: '<p>Our flagship product revolutionizes supply chain management using advanced AI, reducing costs and improving delivery times.</p>', offering: 'SaaS Platform', industry: ['Technology', 'Logistics'], valueChain: ['Logistics', 'Sourcing'], geography: ['North America', 'Europe', 'Asia'], imageUrl: 'https://source.unsplash.com/random/800x600?logistics,network', customFields: [{id: 'scf-1', label: 'ROI', value: 'Up to 20%'}], caseStudies: [caseStudies[0]], testimonials: [testimonials[0]], collaterals: [collaterals[0]], podcasts: podcasts, events: events, isActive: true, revenueFromPlatform: 500000, status: 'active', isSetupFeePaid: true },
     { id: 'sol-2', name: 'Eco-Friendly Packaging', shortDescription: '<p>Sustainable and biodegradable packaging solutions for modern CPG brands aiming to reduce their carbon footprint.</p>', offering: 'Physical Product', industry: ['Consumer Goods', 'Manufacturing'], valueChain: ['Manufacturing', 'Retail'], geography: ['Europe'], imageUrl: 'https://source.unsplash.com/random/800x600?packaging,green', customFields: [{id: 'scf-2', label: 'Material', value: 'Recycled PLA'}], caseStudies: [], testimonials: [], collaterals: [collaterals[1]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 250000, status: 'active', isSetupFeePaid: true  },
     { id: 'sol-3', name: 'Predictive Market Analysis', shortDescription: '<p>A SaaS platform that uses machine learning to forecast market trends, giving financial institutions a competitive edge.</p>', offering: 'SaaS Platform', industry: ['Finance', 'Technology'], valueChain: ['R&D', 'Marketing'], geography: ['North America', 'Europe'], imageUrl: 'https://source.unsplash.com/random/800x600?finance,chart', customFields: [{id: 'scf-3', label: 'Accuracy', value: '92%'}], caseStudies: [caseStudies[2]], testimonials: [testimonials[1]], collaterals: [collaterals[2]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 1200000, status: 'active', isSetupFeePaid: true },
     { id: 'sol-4', name: 'Automated Assembly Robots', shortDescription: '<p>High-precision robotic arms designed for automotive and electronics assembly lines, increasing speed and accuracy.</p>', offering: 'Hardware', industry: ['Automotive', 'Industrial'], valueChain: ['Manufacturing'], geography: ['Asia', 'North America'], imageUrl: 'https://source.unsplash.com/random/800x600?robot,arm', customFields: [{id: 'scf-4', label: 'Uptime', value: '99.8%'}], caseStudies: [caseStudies[1]], testimonials: [testimonials[2]], collaterals: [collaterals[3]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 2500000, status: 'active', isSetupFeePaid: true },
     { id: 'sol-5', name: 'Farm-to-Table Supply Chain', shortDescription: '<p>A fully transparent sourcing and logistics service for organic food producers and retailers.</p>', offering: 'Service', industry: ['Agriculture', 'Consumer Goods'], valueChain: ['Sourcing', 'Logistics', 'Retail'], geography: ['North America'], imageUrl: 'https://source.unsplash.com/random/800x600?farm,fresh', customFields: [], caseStudies: [], testimonials: [testimonials[3]], collaterals: [collaterals[4]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 150000, status: 'active', isSetupFeePaid: true },
     { id: 'sol-6', name: 'AI Diagnostic Imaging', shortDescription: '<p>Cutting-edge AI software that assists radiologists in identifying anomalies in medical scans with greater speed and accuracy.</p>', offering: 'Software', industry: ['Healthcare', 'Technology'], valueChain: ['R&D'], geography: ['North America'], imageUrl: 'https://source.unsplash.com/random/800x600?mri,scan', customFields: [], caseStudies: [], testimonials: [], collaterals: [collaterals[5]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 75000, status: 'active', isSetupFeePaid: true },
     { id: 'sol-7', name: 'Last-Mile Delivery Drones', shortDescription: '<p>A fleet of autonomous drones for rapid and efficient urban and suburban package delivery.</p>', offering: 'Service', industry: ['Logistics', 'Retail'], valueChain: ['Logistics'], geography: ['Europe', 'North America'], imageUrl: 'https://source.unsplash.com/random/800x600?drone,delivery', customFields: [{id: 'scf-5', label: 'Avg. Delivery', value: '15 mins'}], caseStudies: [], testimonials: [], collaterals: [collaterals[6]], podcasts: [], events: [], isActive: true, revenueFromPlatform: 450000, status: 'active', isSetupFeePaid: true },
];

const mockDueDiligenceData1: DueDiligenceData = {
    executiveSummary: '<p>Innovate Solutions is a high-growth AI logistics company with a proven track record of delivering significant ROI for enterprise clients. Strong market position and clear path to profitability. AI-driven analysis suggests a strong buy.</p>',
    financials: {
      summary: [{ year: 2023, revenue: 100000000, cogs: 40000000, grossProfit: 60000000, operatingExpenses: 30000000, operatingIncome: 30000000, netIncome: 21000000, currentAssets: 50000000, totalAssets: 80000000, currentLiabilities: 20000000, totalLiabilities: 25000000, equity: 55000000, cashFromOps: 25000000, cashFromInvesting: -5000000, cashFromFinancing: 2000000, netCashFlow: 22000000 }],
      ratios: [{ name: 'Gross Margin', value: '60%', benchmark: '55%', competitor1: '58%', competitor2: '52%' }],
      revenueBreakdown: [{ name: 'SaaS Subscriptions', value: 80 }, { name: 'Consulting', value: 20 }],
      costBreakdown: [{ name: 'R&D', value: 40 }, { name: 'S&M', value: 30 }, { name: 'G&A', value: 30 }],
      risks: [{ id: 'risk1', label: 'Market Competition', value: 'High competition from established players.', showOnIntroCard: false }]
    },
    commercials: {
      marketSize: '$5B',
      marketTrends: ['AI adoption in logistics', 'Demand for supply chain visibility'],
      targetSegments: ['Large Enterprise Retail', '3PL Providers'],
      customerMetrics: [{ name: 'LTV', value: '₹4 Cr', benchmark: '₹3.5 Cr' }, { name: 'CAC', value: '₹50 Lakh', benchmark: '₹65 Lakh'}, {name: 'Churn Rate', value: '5%', benchmark: '8%'}],
      marketShare: '2%',
      uvp: 'Proprietary routing algorithm delivers 15% more cost savings than competitors.',
      competitors: [{ name: 'LogiNext', marketShare: '5%', uvp: 'Wider network coverage' }, { name: 'FourKites', marketShare: '8%', uvp: 'Stronger brand recognition'}],
      salesConversionRate: '15%',
      revenueConcentration: 'Top 3 clients account for 40% of revenue.'
    },
    funding: {
      timeline: [{ id: 'f1', stage: 'Seed', date: '2021-06-01', amountRaised: 2000000, valuation: 10000000, leadInvestors: ['Seed Ventures'], equityDiluted: 20 }],
      currentRound: { status: 'open', targetRaise: 10000000 },
      capTable: [{ name: 'Founders', value: 60 }, { name: 'Investors', value: 20 }, { name: 'ESOP', value: 20 }],
      comparison: { benchmarkRaise: 8000000, competitor1Raise: 12000000, competitor2Raise: 7000000 }
    },
    riskAndLegal: {
      risks: [{ id: 'legal1', label: 'Data Privacy', value: 'Subject to GDPR and CCPA regulations.', showOnIntroCard: false }],
      diligenceStatus: [{ area: 'Financials', progress: 100 }, { area: 'Legal', progress: 80 }, { area: 'Commercial', progress: 95 }]
    }
  };
  
  const mockDueDiligenceData2: DueDiligenceData = {
      executiveSummary: '<p>DataWeave Analytics offers a best-in-class predictive analytics platform for financial institutions. With high accuracy rates and a scalable SaaS model, it is poised for significant growth in the fintech sector. AI analysis indicates moderate risk with high reward potential.</p>',
      financials: {
          summary: [{ year: 2023, revenue: 250000000, cogs: 50000000, grossProfit: 200000000, operatingExpenses: 120000000, operatingIncome: 80000000, netIncome: 60000000, currentAssets: 100000000, totalAssets: 150000000, currentLiabilities: 40000000, totalLiabilities: 40000000, equity: 110000000, cashFromOps: 70000000, cashFromInvesting: -10000000, cashFromFinancing: 0, netCashFlow: 60000000 }],
          ratios: [{ name: 'Net Profit Margin', value: '24%', benchmark: '20%', competitor1: '22%', competitor2: '18%' }],
          revenueBreakdown: [{ name: 'Enterprise Licenses', value: 90 }, { name: 'Data APIs', value: 10 }],
          costBreakdown: [{ name: 'R&D', value: 50 }, { name: 'S&M', value: 30 }, { name: 'G&A', value: 20 }],
          risks: [{ id: 'risk2', label: 'Model Accuracy', value: 'Dependent on continuous model training and data quality.', showOnIntroCard: false }]
      },
      commercials: {
          marketSize: '$12B',
          marketTrends: ['Algorithmic trading growth', 'Demand for alternative data'],
          targetSegments: ['Hedge Funds', 'Investment Banks'],
          customerMetrics: [{ name: 'ARPU', value: '₹1 Cr/yr', benchmark: '₹80 Lakh/yr' }, { name: 'CAC Payback', value: '18 months', benchmark: '24 months'}, {name: 'Churn Rate', value: '3%', benchmark: '6%'}],
          marketShare: '1.5%',
          uvp: 'Incorporates non-traditional data sources for higher prediction accuracy.',
          competitors: [{ name: 'AlphaSense', marketShare: '10%', uvp: 'Larger data library' }, { name: 'QuantConnect', marketShare: '4%', uvp: 'Open-source platform'}],
          salesConversionRate: '10%',
          revenueConcentration: 'Top 5 clients make up 60% of revenue.'
      },
      funding: {
          timeline: [
              { id: 'f2-1', stage: 'Seed', date: '2020-01-15', amountRaised: 3000000, valuation: 15000000, leadInvestors: ['Fintech Ventures'], equityDiluted: 20 },
              { id: 'f2-2', stage: 'Series A', date: '2022-03-20', amountRaised: 15000000, valuation: 75000000, leadInvestors: ['Growth Capital'], equityDiluted: 20 }
          ],
          currentRound: { status: 'closed', targetRaise: 0 },
          capTable: [{ name: 'Founders', value: 45 }, { name: 'Investors', value: 40 }, { name: 'ESOP', value: 15 }],
          comparison: { benchmarkRaise: 12000000, competitor1Raise: 20000000, competitor2Raise: 10000000 }
      },
      riskAndLegal: {
          risks: [{ id: 'legal2', label: 'Regulatory Scrutiny', value: 'Potential for increased regulation in algorithmic trading.', showOnIntroCard: false }],
          diligenceStatus: [{ area: 'Financials', progress: 100 }, { area: 'Legal', progress: 100 }, { area: 'Commercial', progress: 100 }]
      }
  };

// --- SELLERS --- //
const sellers: Seller[] = [
    { id: 'seller-1', companyName: 'Innovate Solutions', companyLogoUrl: 'https://logo.clearbit.com/innovaccer.com', about: 'Leading provider of AI-driven supply chain solutions, helping businesses optimize logistics and reduce operational costs.', solutions: [mockSolutions[0]], keyImpacts: [{area: 'Efficiency', value: '+30%'}, {area: 'Cost Saving', value: '-15%'}], keyContacts: [{name: 'Bob Seller', profileUrl: '#'}], businessStats: {clients: 50, turnover: '10 Cr'}, platformScore: 4.8, customFields: [], subscriptionTier: 'Premium', platformCostLTV: 100000, platformEngagement: 850, followers: 12500, location: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' }, isOpenForInvestment: true, dueDiligence: mockDueDiligenceData1 },
    { id: 'seller-2', companyName: 'GreenPack', companyLogoUrl: 'https://logo.clearbit.com/greenpeace.org', about: 'Pioneering sustainable packaging for a better future. Our materials are 100% biodegradable and compostable.', solutions: [mockSolutions[1]], keyImpacts: [{area: 'Sustainability', value: '-40% Carbon'}], keyContacts: [{name: 'Dana Verde', profileUrl: '#'}], businessStats: {clients: 120, turnover: '5 Cr'}, platformScore: 4.5, customFields: [], subscriptionTier: 'Basic', platformCostLTV: 50000, platformEngagement: 620, followers: 5300, location: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' }, isOpenForInvestment: false },
    { id: 'seller-3', companyName: 'DataWeave Analytics', companyLogoUrl: 'https://logo.clearbit.com/dataiku.com', about: 'Financial analytics powered by next-generation machine learning. We turn data into profit.', solutions: [mockSolutions[2]], keyImpacts: [{area: 'Prediction Accuracy', value: '+7%'}], keyContacts: [{name: 'Nisha Patel', profileUrl: '#'}], businessStats: {clients: 25, turnover: '25 Cr'}, platformScore: 4.9, customFields: [], subscriptionTier: 'Premium', platformCostLTV: 250000, platformEngagement: 950, followers: 25000, location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' }, isOpenForInvestment: true, dueDiligence: mockDueDiligenceData2 },
    { id: 'seller-4', companyName: 'NextGen Robotics', companyLogoUrl: 'https://logo.clearbit.com/bostonrobotics.com', about: 'Building the factories of the future with high-speed, collaborative robotic arms.', solutions: [mockSolutions[3]], keyImpacts: [{area: 'Productivity', value: '+25%'}], keyContacts: [{name: 'Kenji Tanaka', profileUrl: '#'}], businessStats: {clients: 40, turnover: '50 Cr'}, platformScore: 4.7, customFields: [], subscriptionTier: 'Premium', platformCostLTV: 300000, platformEngagement: 910, followers: 18000, location: { lat: 35.6895, lng: 139.6917, city: 'Tokyo', country: 'Japan' }, isOpenForInvestment: true, dueDiligence: mockDueDiligenceData1 },
    { id: 'seller-5', companyName: 'PureSource Organics', companyLogoUrl: 'https://logo.clearbit.com/wholefoodsmarket.com', about: 'Ethical and transparent sourcing for the organic food industry.', solutions: [mockSolutions[4]], keyImpacts: [{area: 'Traceability', value: '100%'}], keyContacts: [{name: 'Maria Garcia', profileUrl: '#'}], businessStats: {clients: 200, turnover: '8 Cr'}, platformScore: 4.6, customFields: [], subscriptionTier: 'Basic', platformCostLTV: 40000, platformEngagement: 580, followers: 8800, location: { lat: 19.4326, lng: -99.1332, city: 'Mexico City', country: 'Mexico' }, isOpenForInvestment: false },
    { id: 'seller-6', companyName: 'Quantum Leap AI', companyLogoUrl: 'https://logo.clearbit.com/nvidia.com', about: 'AI-powered diagnostic tools for healthcare professionals. We help save lives by enabling earlier detection.', solutions: [mockSolutions[5]], keyImpacts: [{area: 'Detection Rate', value: '+18%'}], keyContacts: [{name: 'Dr. Evelyn Reed', profileUrl: '#'}], businessStats: {clients: 15, turnover: '2 Cr'}, platformScore: 4.4, customFields: [], subscriptionTier: 'Free', platformCostLTV: 0, platformEngagement: 450, followers: 2100, location: { lat: 42.3601, lng: -71.0589, city: 'Boston', country: 'USA' }, isOpenForInvestment: true },
    { id: 'seller-7', companyName: 'Urban Mobility Co.', companyLogoUrl: 'https://logo.clearbit.com/uber.com', about: 'The future of urban logistics is here. Fast, reliable, and autonomous drone delivery.', solutions: [mockSolutions[6]], keyImpacts: [{area: 'Delivery Time', value: '-60%'}], keyContacts: [{name: 'Leo Maxwell', profileUrl: '#'}], businessStats: {clients: 30, turnover: '12 Cr'}, platformScore: 4.7, customFields: [], subscriptionTier: 'Premium', platformCostLTV: 120000, platformEngagement: 780, followers: 15600, location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' }, isOpenForInvestment: false },
    { id: 'seller-8', companyName: 'Concept Co.', companyLogoUrl: 'https://logo.clearbit.com/conceptualize.io', about: 'Working on the next big thing. Stay tuned for our solutions.', solutions: [], keyImpacts: [], keyContacts: [{name: 'Ida Idea', profileUrl: '#'}], businessStats: {clients: 0, turnover: '0'}, platformScore: 3.5, customFields: [], subscriptionTier: 'Free', platformCostLTV: 0, platformEngagement: 50, followers: 150, location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' }, isOpenForInvestment: false },
];
export let mockSellers = sellers;

// --- POSTS --- //
const posts: Post[] = [
    { id: 'post-1', sellerId: 'seller-1', solutionId: 'sol-1', title: 'We Upgraded Our Logistics AI!', content: '<p>Just pushed a major update to our AI engine, improving prediction accuracy by 15%. This means more efficient routes and even greater cost savings for our clients.</p>', media: [{type: 'image', url:'https://source.unsplash.com/random/800x600?ai,network'}], likes: 120, comments: [{id: 'c-1', user: users[1], content: 'This looks amazing! Can we get a demo?', timestamp: '1 day ago'}], bookmarks: 12, timestamp: '2 days ago', isLiked: false, isBookmarked: true },
    { id: 'post-2', sellerId: 'seller-2', solutionId: 'sol-2', title: 'New Biodegradable Material', content: '<p>Our new plant-based material is now available for all packaging needs. It decomposes in just 90 days!</p>', media: [{type: 'video', url: 'https://www.youtube.com/embed/Ixv_2hrO1rU'}], likes: 250, comments: [], bookmarks: 45, timestamp: '5 days ago', isLiked: true, isBookmarked: false },
    { id: 'post-3', sellerId: 'seller-3', solutionId: 'sol-3', title: 'Case Study: Global Investment Bank', content: '<p>Discover how we helped a major bank improve their FOREX trading accuracy using our predictive analytics platform.</p>', media: [], sharedContent: { type: 'caseStudy', item: caseStudies[2] }, likes: 310, comments: [{id: 'c-2', user: users[3], content: 'Impressive results. The 7% accuracy gain is significant.', timestamp: '3 hours ago'}], bookmarks: 68, timestamp: '1 day ago', isLiked: true, isBookmarked: true },
    { id: 'post-4', sellerId: 'seller-4', solutionId: 'sol-4', title: 'Robots in Action: See the RoboArm-3000', content: '<p>Check out our latest video showcasing the speed and precision of the RoboArm-3000 on a live assembly line.</p>', media: [{type: 'video', url: 'https://www.youtube.com/embed/tF4DML7FIWk'}], likes: 450, comments: [], bookmarks: 112, timestamp: '3 days ago', isLiked: false, isBookmarked: false },
    { id: 'post-5', sellerId: 'seller-5', solutionId: 'sol-5', title: 'A Glowing Review from Global Retail!', content: '<p>We are thrilled to receive such positive feedback from one of our most valued partners. Transparency is key!</p>', media: [], sharedContent: { type: 'testimonial', item: testimonials[3] }, likes: 180, comments: [], bookmarks: 25, timestamp: '4 days ago', isLiked: false, isBookmarked: false },
    { id: 'post-6', sellerId: 'seller-6', solutionId: 'sol-6', title: 'Early Detection Saves Lives', content: '<p>Our AI diagnostic tool is now being trialed in 5 hospitals, helping radiologists spot anomalies faster than ever before.</p>', media: [{type: 'image', url: 'https://source.unsplash.com/random/800x600?hospital,doctor'}], likes: 95, comments: [], bookmarks: 15, timestamp: '6 days ago', isLiked: false, isBookmarked: false },
    { id: 'post-7', sellerId: 'seller-7', solutionId: 'sol-7', title: 'Drone Delivery Network Expands to London', content: '<p>We are excited to announce the launch of our last-mile drone delivery service in London! Expect delivery times under 20 minutes.</p>', media: [{type: 'image', url: 'https://source.unsplash.com/random/800x600?london,drone'}], likes: 220, comments: [], bookmarks: 50, timestamp: '1 week ago', isLiked: true, isBookmarked: true },
    { id: 'post-8', sellerId: 'seller-1', solutionId: 'sol-1', title: 'New Whitepaper on Supply Chain Resilience', content: '<p>Download our latest whitepaper on how to build a resilient supply chain in a post-pandemic world using AI and machine learning.</p>', media: [], sharedContent: { type: 'collateral', item: collaterals[0] }, likes: 88, comments: [], bookmarks: 30, timestamp: '1 week ago', isLiked: false, isBookmarked: false },
    { id: 'post-9', sellerId: 'seller-4', solutionId: 'sol-4', title: 'A Testimonial from QuickLogistics!', content: '<p>We love hearing from happy customers. Thanks, Mike, for the fantastic review of our warehouse automation solutions!</p>', media: [], sharedContent: {type: 'testimonial', item: testimonials[2]}, likes: 155, comments: [], bookmarks: 22, timestamp: '2 weeks ago', isLiked: false, isBookmarked: false},
    { id: 'post-10', sellerId: 'seller-3', solutionId: 'sol-3', title: 'Market Volatility on the Rise', content: '<p>Our platform is detecting increased volatility in the energy sector. Clients can log in to view our detailed forecast and recommendations.</p>', media: [{type: 'image', url: 'https://source.unsplash.com/random/800x600?stock,market,graph'}], likes: 190, comments: [], bookmarks: 41, timestamp: '2 weeks ago', isLiked: false, isBookmarked: true },
    { id: 'post-11', sellerId: 'seller-1', solutionId: 'sol-1', title: 'Thank You for the Glowing Review!', content: 'We are proud to share this testimonial from our partner, Global Retail.', media: [], sharedContent: { type: 'testimonial', item: testimonials[0] }, likes: 130, comments: [], bookmarks: 18, timestamp: 'Just now', isLiked: false, isBookmarked: false },
    { id: 'post-12', sellerId: 'seller-4', solutionId: 'sol-4', title: 'Productivity Gains: A New Case Study', content: 'See how we helped a major auto manufacturer boost their production by 25%.', media: [{type: 'image', url: 'https://source.unsplash.com/random/800x600?factory,assembly'}], sharedContent: { type: 'caseStudy', item: caseStudies[1] }, likes: 280, comments: [], bookmarks: 75, timestamp: '8 hours ago', isLiked: false, isBookmarked: false},
    { id: 'post-13', sellerId: 'seller-7', solutionId: 'sol-7', title: 'The Sky is Not the Limit', content: 'Our new X1 drone model has a 15km range and can carry up to 5kg. The future of delivery is here.', media: [{type: 'video', url: 'https://www.youtube.com/embed/3uF3n9B4wPA'}], likes: 350, comments: [], bookmarks: 90, timestamp: '1 day ago', isLiked: true, isBookmarked: false},
    { id: 'post-14', sellerId: 'seller-2', solutionId: 'sol-2', title: 'From Brown to Green', content: 'Making the switch to sustainable packaging is easier than you think. Contact us for a free consultation.', media: [{type: 'image', url: 'https://source.unsplash.com/random/800x600?leaf,box'}], likes: 110, comments: [], bookmarks: 19, timestamp: '2 days ago', isLiked: false, isBookmarked: false},
    { id: 'post-15', author: users[1], sellerId: 'seller-4', solutionId: 'sol-4', title: 'Amazing Tech from NextGen Robotics', content: 'As a buyer, I was incredibly impressed by the demo from NextGen Robotics. Their assembly line tech is top-notch.', media: [], likes: 45, comments: [], bookmarks: 5, timestamp: '3 days ago', isLiked: false, isBookmarked: false},
];
// Add comments
posts[3].comments.push({id: 'c-3', user: users[9], content: 'The video is stunning. The precision is unreal.', timestamp: '2 days ago'});
posts[6].comments.push({id: 'c-4', user: users[1], content: 'When are you expanding to the US?', timestamp: '6 days ago'});
posts[12].comments.push({id: 'c-5', user: users[1], content: 'This is exactly what we need for our new distribution center!', timestamp: '2 hours ago'});
posts[12].comments.push({id: 'c-6', user: users[9], content: 'Can these be integrated with existing warehouse management software?', timestamp: '1 hour ago'});
export let mockPosts = posts;


// --- INBOX ITEMS --- //
const inboxItems: InboxItem[] = [
    { id: 'inbox-1', category: 'Meeting Request', fromUser: users[1], content: 'Interested in a demo of your AI platform.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', relatedSellerId: 'seller-1', meetingDetails: { message: 'Can we connect sometime next week to discuss our logistics needs?', proposedTime: '2024-08-05T10:00', status: 'pending' } },
    { id: 'inbox-2', category: 'Engagement', fromUser: users[3], content: 'liked your post "New Biodegradable Material".', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Actioned', relatedPostId: 'post-2', relatedSellerId: 'seller-2' },
    { id: 'inbox-3', category: 'Sales Enquiry', fromUser: users[9], content: 'What is the pricing model for the Predictive Market Analysis platform?', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'Pending', relatedSellerId: 'seller-3' },
    { id: 'inbox-4', category: 'Meeting Request', fromUser: users[1], content: 'We are looking to automate our assembly line.', timestamp: new Date(Date.now() - 259200000).toISOString(), status: 'Pending', relatedSellerId: 'seller-4', meetingDetails: { message: 'We were impressed by your video. We would like to schedule a technical consultation.', proposedTime: '2024-08-08T14:00', status: 'pending' } },
    { id: 'inbox-5', category: 'Engagement', fromUser: users[3], content: 'commented on your post "Case Study: Global Investment Bank".', timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'Actioned', relatedPostId: 'post-3', relatedSellerId: 'seller-3' },
    { id: 'inbox-6', category: 'Collaboration Request', fromUser: users[8], content: 'We see a potential synergy between our companies.', timestamp: new Date(Date.now() - 345600000).toISOString(), status: 'Pending', relatedSellerId: 'seller-7' },
    { id: 'inbox-7', category: 'Engagement', fromUser: users[1], content: 'commented on your post "Drone Delivery Network Expands to London".', timestamp: new Date(Date.now() - 604800000).toISOString(), status: 'Actioned', relatedPostId: 'post-7', relatedSellerId: 'seller-7' },
    { id: 'inbox-8', category: 'Message', fromUser: users[9], content: 'Following up on my enquiry about the market analysis platform.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', relatedSellerId: 'seller-3' },
];
export let mockInboxItems = inboxItems;

// --- ENTERPRISES --- //
const enterprisesData: Enterprise[] = [
  { id: 'ent-1', companyName: 'Innovate Solutions', address: '123 Tech Park, Mumbai', entityType: 'Private entity', gstNumber: 'GSTIN123', persona: 'Seller', subscriptionPlan: 'Pro', associationCode: 'INNOV8', members: ['user-3', 'user-5'], pendingMembers: ['user-8'], location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' } },
  { id: 'ent-2', companyName: 'Global Retail', address: '456 Commerce Rd, New York', entityType: 'Listed Entity', gstNumber: 'GSTIN456', persona: 'Buyer', subscriptionPlan: 'Enterprise', associationCode: 'GLOBAL', members: ['user-2'], location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' } },
  { id: 'ent-3', companyName: 'GreenPack', address: '789 Eco Lane, Berlin', entityType: 'Partnership', gstNumber: 'GSTIN789', persona: 'Seller', subscriptionPlan: 'Basic', associationCode: 'ECOPACK', members: [], location: { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany' } }
];
export let enterprises = enterprisesData;


// --- ADMIN & CONFIG --- //
export const mockMonetizationRules: MonetizationRule[] = [
    { id: 'rule-1', persona: 'Seller', chargeType: 'Joining Fee', amount: 4999, currency: 'INR', country: 'All', frequency: 'one-time' },
    { id: 'rule-2', persona: 'Buyer', chargeType: 'Joining Fee', amount: 99, currency: 'INR', country: 'All', frequency: 'one-time' },
    { id: 'rule-3', persona: 'Collaborator', chargeType: 'Joining Fee', amount: 99, currency: 'INR', country: 'All', frequency: 'one-time' },
    { id: 'rule-4', persona: 'Seller', chargeType: 'Monthly Subscription', amount: 999, currency: 'INR', country: 'All', frequency: 'monthly' },
    { id: 'rule-5', persona: 'Seller', chargeType: 'Transaction Fee', amount: 49, currency: 'INR', country: 'All', frequency: 'per_transaction' },
];


export const monetizationPlans: Record<SubscriptionPlan, {name: string, price: string, features: string[]}> = {
    'Free': { name: 'Free Tier', price: '₹0 / month', features: ['Basic Profile', 'Post Updates', 'Limited Analytics'] },
    'Basic': { name: 'Basic Plan', price: '₹5,000 / month', features: ['Enhanced Profile', 'More Posts', 'Basic Dashboard', 'Active Wallet'] },
    'Pro': { name: 'Pro Plan', price: '₹15,000 / month', features: ['Full Profile Customization', 'Unlimited Posts', 'Advanced Analytics', 'Lead Generation Tools', 'Active Wallet'] },
    'Enterprise': { name: 'Enterprise', price: 'Custom Pricing', features: ['Everything in Pro', 'Dedicated Support', 'API Access', 'Custom Integrations', 'Team Management'] },
}

export const featureAccessKeys: { key: FeatureKey, name: string, description: string }[] = [
    { key: 'canViewFeed', name: 'View Feed', description: 'Can see the main content feed.' },
    { key: 'canUseInbox', name: 'Use Inbox', description: 'Can send and receive messages.' },
    { key: 'canUseFavourites', name: 'Use Favourites', description: 'Can save posts and sellers.' },
    { key: 'canViewProfiles', name: 'View Profiles', description: 'Can view detailed seller/buyer profiles.' },
    { key: 'canMessage', name: 'Send Messages', description: 'Can initiate direct messages.' },
    { key: 'canRequestMeeting', name: 'Request Meetings', description: 'Can request meetings with others.' },
    { key: 'canPost', name: 'Create Posts', description: '(Sellers only) Can publish updates.' },
    { key: 'canManageContent', name: 'Manage Content', description: '(Sellers only) Can manage solutions, testimonials, etc.' },
    { key: 'canViewDashboard', name: 'View Dashboard', description: '(Sellers only) Can see their performance dashboard.' },
    { key: 'canViewAnalytics', name: 'View Global Analytics', description: '(Sellers only) Can access market and competitor insights.' },
    { key: 'canAccessAdmin', name: 'Platform Admin', description: 'Can access the global administration panel.' },
];

export const initialAccessConfig: AccessConfig = {
    Admin: { canViewFeed: true, canUseInbox: true, canUseFavourites: true, canViewProfiles: true, canMessage: true, canRequestMeeting: true, canPost: true, canManageContent: true, canViewDashboard: true, canViewAnalytics: true, canAccessAdmin: true },
    Buyer: { canViewFeed: true, canUseInbox: true, canUseFavourites: true, canViewProfiles: true, canMessage: true, canRequestMeeting: true, canPost: false, canManageContent: false, canViewDashboard: false, canViewAnalytics: false, canAccessAdmin: false },
    Seller: { canViewFeed: true, canUseInbox: true, canUseFavourites: true, canViewProfiles: true, canMessage: true, canRequestMeeting: true, canPost: true, canManageContent: true, canViewDashboard: true, canViewAnalytics: true, canAccessAdmin: false },
    Investor: { canViewFeed: true, canUseInbox: true, canUseFavourites: true, canViewProfiles: true, canMessage: true, canRequestMeeting: true, canPost: false, canManageContent: false, canViewDashboard: false, canViewAnalytics: true, canAccessAdmin: false },
    Collaborator: { canViewFeed: true, canUseInbox: true, canUseFavourites: true, canViewProfiles: true, canMessage: true, canRequestMeeting: false, canPost: false, canManageContent: false, canViewDashboard: false, canViewAnalytics: false, canAccessAdmin: false },
    Browser: { canViewFeed: true, canUseInbox: false, canUseFavourites: true, canViewProfiles: false, canMessage: false, canRequestMeeting: false, canPost: false, canManageContent: false, canViewDashboard: false, canViewAnalytics: false, canAccessAdmin: false },
};

// --- DASHBOARD DATA --- //
const recentActivityForDashboard: (Enquiry | MeetingRequest)[] = mockInboxItems.slice(0, 5).map(item => {
    const base = {
      id: item.id,
      userId: item.fromUser.id,
      timestamp: item.timestamp,
    };
    if (item.category === 'Meeting Request' && item.meetingDetails) {
      return {
        ...base,
        status: item.meetingDetails.status,
      } as MeetingRequest;
    }
    // All other types will be treated as Enquiry for the dashboard
    return {
      ...base,
      message: item.content,
    } as Enquiry;
  });

export const mockDashboardData = {
    stats: {
        profileViews: { value: '1,254', change: '+12%' },
        engagement: { value: '8,621', change: '+8%' },
        enquiries: { value: '78', change: '+5%' },
        meetings: { value: '12', change: '-10%' },
    },
    engagementData: { '2023-10-01': 100, '2023-10-02': 120, /* ... more data ... */ },
    audienceData: { 'Buyer': 450, 'Investor': 120, 'Collaborator': 80, 'Browser': 604 },
    topPosts: [{ ...mockPosts[3], engagement: 450 }, { ...mockPosts[2], engagement: 320 }],
    recentActivity: recentActivityForDashboard,
    engagedCompanies: [{id: 'comp-1', name: 'Global Retail', logoUrl: 'https://logo.clearbit.com/walmart.com', sector: 'Retail', employees: 10000}]
};

export const mockEngagementEvents = [
    { userId: 'user-2', location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' } },
    { userId: 'user-4', location: { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'USA' } },
    { userId: 'user-2', location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' } },
    { userId: 'user-10', location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India' } },
    { userId: 'user-4', location: { lat: 35.6895, lng: 139.6917, city: 'Tokyo', country: 'Japan' } },
];