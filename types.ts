// types.ts

export type Persona = 'Admin' | 'Buyer' | 'Seller' | 'Investor' | 'Collaborator' | 'Browser';

export type View = 'feed' | 'userProfile' | 'sellerProfile' | 'favourites' | 'inbox' | 'network' | 'admin';
export type ScopeFilter = 'all' | 'connections' | 'favourites' | 'invstScan';
export type ProfileTab = 'about' | 'posts' | 'manage' | 'analytics' | 'investment';

export type SubscriptionPlan = 'Free' | 'Basic' | 'Pro' | 'Enterprise';

export type FeatureKey =
    | 'canViewFeed'
    | 'canUseInbox'
    | 'canUseFavourites'
    | 'canViewProfiles'
    | 'canMessage'
    | 'canRequestMeeting'
    | 'canPost'
    | 'canManageContent'
    | 'canViewDashboard'
    | 'canViewAnalytics'
    | 'canAccessAdmin';

export type AccessConfig = Record<Persona, Record<FeatureKey, boolean>>;

export interface ScopeOption {
    id: ScopeFilter;
    label: string;
    description: string;
    isEnabled: boolean;
}

export interface PlatformSettings {
    valueChains: string[];
    geographies: string[];
    industries: string[];
    offerings: string[];
    scopes: ScopeOption[];
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'due';
}

export interface EnterpriseInvite {
    enterpriseId: string;
    enterpriseName: string;
}

export interface PaymentMethod {
    id: string;
    type: 'Card' | 'Netbanking';
    provider: string; // e.g., 'Visa', 'HDFC Bank'
    last4: string; // last 4 digits or account number hint
}

export interface MonetizationRule {
    id: string;
    persona: Persona | 'All';
    chargeType: 'Joining Fee' | 'Monthly Subscription' | 'Transaction Fee';
    amount: number;
    currency: 'INR' | 'USD' | 'EUR';
    country: string; // 'All' for global
    frequency: 'one-time' | 'monthly' | 'per_transaction';
}


export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    persona: Persona;
    designation: string;
    company: string;
    role: 'Admin' | 'Member';
    roleInCompany?: string;
    personalEmail: string;
    isPersonalEmailVerified: boolean;
    businessEmail: string;
    isBusinessEmailVerified: boolean;
    phone?: string;
    preferredContactEmail?: 'personal' | 'business';
    walletBalance?: number;
    interests?: {
        valueChain: string[];
        geography: string[];
        industry: string[];
        offering?: string[];
    };
    connections?: string[]; // array of seller IDs or user IDs
    followedSellers?: string[]; // array of seller IDs
    likedSellers?: string[]; // array of seller IDs
    savedSellers?: string[]; // array of seller IDs
    wantsEmailNotifications: boolean;
    password?: string;
    subscriptionPlan?: SubscriptionPlan;
    transactionHistory?: Transaction[];
    enterpriseId?: string;
    enterpriseInvite?: EnterpriseInvite;
    // Referral fields
    referralCode: string;
    referredBy?: string; // ID of the user who referred them
    referrals?: {
        userId: string;
        name: string;
        persona: Persona;
        date: string;
        initialCredit: number;
    }[];
    monthlyReferralEarnings?: {
        sellerId: string;
        sellerName: string;
        monthlyCredit: number;
    }[];
    // Monetization fields
    trialEndsAt?: string; // ISO Date string
    isDormant?: boolean;
    messageCredits?: {
        remaining: number;
        resetsAt: string; // ISO Date string
    };
    paymentMethods?: PaymentMethod[];
    preferredPaymentMethodId?: string;
}

export interface GeoLocation {
    lat: number;
    lng: number;
    city: string;
    country: string;
}

export type EntityType = 'Listed Entity' | 'Public Entity' | 'Private entity' | 'Partnership' | 'LLP' | 'Sole Proprietorship';

export interface Enterprise {
    id: string;
    companyName: string;
    address: string;
    entityType: EntityType;
    gstNumber: string;
    persona: 'Seller' | 'Buyer' | 'Investor';
    subscriptionPlan: SubscriptionPlan;
    associationCode: string;
    members: string[]; // array of user IDs
    pendingMembers?: string[];
    location: GeoLocation;
}


export interface KeyImpact {
    area: string;
    value: string;
}

export interface BusinessStats {
    clients: number;
    turnover: string; // e.g., "10 Cr"
}

export interface KeyContact {
    name: string;
    profileUrl: string;
}

export interface SellerCustomField {
    id: string;
    label: string;
    value: string;
    showOnIntroCard: boolean;
}

// --- Due Diligence Data Structures --- //

export interface FinancialStatementEntry {
    year: number;
    // Income Statement
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    netIncome: number;
    // Balance Sheet
    cashAndEquivalents: number;
    totalAssets: number;
    currentLiabilities: number;
    longTermDebt: number;
    totalLiabilities: number;
    equity: number;
    // Cash Flow
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netChangeInCash: number;
}

export interface ComparisonMetric {
    name: string;
    businessValue: string | number;
    industryAverage: string | number;
    competitor1: string | number;
    competitor2: string | number;
    unit?: string;
    isFinancial?: boolean; // to formatting
}

export interface RevenueSource {
    name: string;
    value: number; // percentage
}

export interface FinancialsData {
    statements: FinancialStatementEntry[]; // History 3-5 years
    keyRatios: ComparisonMetric[]; // Gross Margin, Burn Rate etc. vs Industry/Comps
    revenueBreakdown: {
        recurring: number; // percentage
        oneTime: number; // percentage
        sources: RevenueSource[];
        historicGrowth: { year: number; revenue: number }[];
    };
    risks: SellerCustomField[]; // Outstanding loans, etc.
}

export interface Competitor {
    name: string;
    marketShare: string;
    uvp: string;
}

export interface CommercialsData {
    marketOverview: {
        size: string;
        cagr: string;
        trends: string[];
        segments: string[];
    };
    customerMetrics: {
        count: number;
        cac: string;
        churnRate: string;
        ltv: string;
        mau?: string;
    };
    marketShare: string;
    uvp: string;
    mainCompetitors: Competitor[];
    salesPipeline: {
        topClients: string[]; // Names
        conversionRates: string;
        revenueConcentration: string;
    };
    competitiveLandscape: ComparisonMetric[]; // Business vs Industry vs Comps
}

export interface FundingRound {
    id: string;
    stage: string;
    date: string;
    amountRaised: number;
    valuation: number;
    leadInvestors: string[];
    equityDiluted: number;
}

export interface CapTableEntry {
    name: string;
    value: number; // percentage
}

export interface FundingData {
    timeline: FundingRound[];
    currentRound: {
        status: 'open' | 'closed' | 'ongoing';
        targetRaise: number;
    };
    capTable: CapTableEntry[];
}

export interface DiligenceStatus {
    area: string;
    progress: number; // 0-100
}

export interface RiskLegalData {
    risks: SellerCustomField[];
    diligenceStatus: DiligenceStatus[];
}

export interface DueDiligenceData {
    executiveSummary: string;
    financials: FinancialsData;
    commercials: CommercialsData;
    funding: FundingData;
    riskAndLegal: RiskLegalData;
}


export interface Seller {
    id: string;
    companyName: string;
    companyLogoUrl: string;
    about: string;
    solutions: Solution[];
    keyImpacts: KeyImpact[];
    keyContacts: KeyContact[];
    businessStats: BusinessStats;
    platformScore: number;
    customFields: SellerCustomField[];
    subscriptionTier: 'Free' | 'Basic' | 'Premium';
    platformCostLTV: number;
    platformEngagement: number;
    location: GeoLocation;
    followers: number;
    isOpenForInvestment: boolean;
    dueDiligence?: DueDiligenceData;
    events?: Event[];
}

export enum CollateralType {
    PDF = 'PDF',
    Presentation = 'Presentation',
    Image = 'Image',
}

export interface RichTextCustomField {
    id: string;
    label: string;
    content: string;
}

export interface CaseStudy {
    id: string;
    clientName: string;
    clientNeed: string; // Rich text
    solutionApproach: string; // Rich text
    solutionDescription: string; // Rich text
    implementationTime: string; // e.g., "6 Months"
    referenceAvailable: boolean;
    isClientApproved: boolean;
    customFields: RichTextCustomField[];
}

export interface Testimonial {
    id: string;
    customerName: string;
    quote: string;
    videoUrl?: string;
    scores: {
        quality: number;
        time: number;
        cost: number;
        experience: number;
        solutionImpact: number;
    };
}

export interface Collateral {
    id: string;
    name: string;
    fileName: string;
    type: CollateralType;
}

export interface Podcast {
    id: string;
    title: string;
    narrative: string;
}

export interface Event {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    time: string;
    venue: string;
    virtualLink?: string;
    geography?: string[];
    industry?: string[];
    valueChain?: string[];
    registrationLink?: string;
    speakingOpportunity?: boolean;
    speakingSlots?: number;
    delegateRegistration?: 'Free' | 'Paid' | 'None';
    delegateSlots?: number;
    isPublic?: boolean;
    programManagerId?: string; // Reference to the Program Manager's user ID for direct messaging
}

export interface SolutionCustomField {
    id: string;
    label: string;
    value: string;
}

export interface Solution {
    id: string;
    name: string;
    shortDescription: string; // Rich text
    offering: string;
    industry: string[];
    valueChain: string[];
    geography: string[];
    imageUrl: string;
    customFields: SolutionCustomField[];
    caseStudies: CaseStudy[];
    testimonials: Testimonial[];
    collaterals: Collateral[];
    podcasts: Podcast[];
    events: Event[];
    isActive: boolean;
    revenueFromPlatform?: number;
    // Monetization fields
    status: 'active' | 'inactive' | 'on_hold';
    isSetupFeePaid: boolean;
    holdPeriod?: { start: string; end: string };
}

export interface Media {
    type: 'image' | 'video' | 'audio';
    url: string;
}

export type SharedContentItem = Testimonial | Collateral | CaseStudy | Podcast | Event;

export interface SharedContent {
    type: 'testimonial' | 'collateral' | 'caseStudy' | 'podcast' | 'event';
    item: SharedContentItem;
}

export interface Comment {
    id: string;
    user: User;
    content: string;
    timestamp: string;
}

export interface Post {
    id: string;
    sellerId: string;
    solutionId: string;
    title: string;
    content: string; // Rich text
    media: Media[];
    sharedContent?: SharedContent;
    likes: number;
    comments: Comment[];
    bookmarks: number;
    timestamp: string;
    isLiked: boolean;
    isBookmarked: boolean;
    author?: User; // for user-generated posts
}

export type MeetingPlatform = 'Google Meet' | 'Microsoft Teams' | 'Zoom';

export interface MeetingDetails {
    message: string;
    proposedTime: string;
    status: 'pending' | 'accepted' | 'declined';
    meetingLink?: string;
    platform?: MeetingPlatform;
    additionalParticipants?: string[];
}

export type InboxItemCategory = 'MeetingRequest' | 'SalesEnquiry' | 'Engagement' | 'CollaborationRequest' | 'Message' | 'ConnectionRequest';

export interface InboxItem {
    id: string;
    category: InboxItemCategory;
    fromUser: User;
    content: string;
    timestamp: string;
    status: 'Pending' | 'Actioned' | 'Archived';
    relatedSellerId?: string;
    relatedUserId?: string;
    relatedPostId?: string;
    meetingDetails?: MeetingDetails;
    attachments?: SharedContent[];
    connectionRequestDetails?: 'Accepted' | 'Declined';
}

// For dashboard
export interface Enquiry {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
}

export interface MeetingRequest {
    id: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined';
    timestamp: string;
}

export interface CompanyProfile {
    id: string;
    name: string;
    logoUrl: string;
    sector: string;
    employees: number;
}