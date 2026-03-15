export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:3001/api';

export const USERS = {
    admin: {
        email: 'admin@hyperconnect.com',
        password: 'password123',
        name: 'Admin User',
        persona: 'Admin',
    },
    buyer: {
        email: 'buyer@hyperconnect.com',
        password: 'password123',
        name: 'Buyer User',
        persona: 'Buyer',
    },
    seller: {
        email: 'bob@innovate.com',
        password: 'password123',
        name: 'Bob Seller',
        persona: 'Seller',
    },
    alice: {
        email: 'alice@globalretail.com',
        password: 'password123',
        name: 'Alice Buyer',
        persona: 'Buyer',
    },
} as const;

// Seeded seller names from DB
export const KNOWN_SELLERS = ['DataWeave Analytics', 'Innovate Solutions', 'NextGen Robotics'];

export const TIMEOUTS = {
    short: 3_000,
    medium: 8_000,
    long: 15_000,
};
