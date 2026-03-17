/**
 * SPEC: Signup Data Persistence
 * Validates that all fields collected during signup (interests, phone, businessEmail)
 * are correctly saved to the database and retrievable via the API.
 */
import { test, expect } from '@playwright/test';
import { API_URL } from '../fixtures/testData';

// Unique user for this test run to avoid conflicts
const timestamp = Date.now();
const testUser = {
    email: `test.signup.${timestamp}@personal.com`,
    password: 'TestPass123!',
    name: `Test Seller ${timestamp}`,
    persona: 'Seller',
    designation: 'CTO',
    company: `Test Corp ${timestamp}`,
    businessEmail: `test.signup.${timestamp}@business.com`,
    phone: '9876543210',
    interests: {
        industry: ['Healthcare', 'Fintech'],
        geography: ['India', 'Southeast Asia'],
        valueChain: ['Manufacturing', 'Distribution'],
        offering: ['SaaS', 'Consulting'],
    },
};

test.describe('Signup Data Persistence', () => {
    let newUserToken = '';
    let newUserId = '';

    test('55 – POST /auth/register persists all signup fields', async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/register`, {
            data: {
                email: testUser.email,
                password: testUser.password,
                name: testUser.name,
                persona: testUser.persona,
                designation: testUser.designation,
                company: testUser.company,
                businessEmail: testUser.businessEmail,
                phone: testUser.phone,
                interests: testUser.interests,
            },
        });

        expect(res.status()).toBe(201);
        const body = await res.json();

        // Token and user must be returned
        expect(body.token).toBeTruthy();
        expect(body.user).toBeTruthy();

        // Store for subsequent tests
        newUserToken = body.token;
        newUserId = body.user.id;

        // Assert all fields are returned in register response
        expect(body.user.businessEmail).toBe(testUser.businessEmail);
        expect(body.user.phone).toBe(testUser.phone);
        expect(body.user.interests).not.toBeNull();
    });

    test('56 – GET /users/me returns interests, phone and businessEmail after signup', async ({ request }) => {
        // Re-register if previous test was isolated
        if (!newUserToken) {
            const loginRes = await request.post(`${API_URL}/auth/register`, {
                data: {
                    email: `retry.${testUser.email}`,
                    password: testUser.password,
                    name: testUser.name,
                    persona: testUser.persona,
                    designation: testUser.designation,
                    company: testUser.company,
                    businessEmail: testUser.businessEmail,
                    phone: testUser.phone,
                    interests: testUser.interests,
                },
            });
            const loginBody = await loginRes.json();
            newUserToken = loginBody.token;
        }

        const meRes = await request.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${newUserToken}` },
        });

        expect(meRes.ok()).toBeTruthy();
        const user = await meRes.json();

        // Core identity
        expect(user.name).toBe(testUser.name);
        expect(user.personalEmail || user.email).toBe(testUser.email);

        // Issue 2: businessEmail and phone must be present
        expect(user.businessEmail).toBe(testUser.businessEmail);
        expect(user.phone).toBe(testUser.phone);

        // Issue 1: interests must be saved
        expect(user.interests).not.toBeNull();
        expect(user.interests).not.toBeUndefined();
        if (user.interests) {
            expect(Array.isArray(user.interests.industries)).toBeTruthy();
            expect(user.interests.industries).toEqual(expect.arrayContaining(testUser.interests.industry));
            expect(Array.isArray(user.interests.geographies)).toBeTruthy();
            expect(user.interests.geographies).toEqual(expect.arrayContaining(testUser.interests.geography));
            expect(Array.isArray(user.interests.valueChains)).toBeTruthy();
            expect(user.interests.valueChains).toEqual(expect.arrayContaining(testUser.interests.valueChain));
            expect(Array.isArray(user.interests.offerings)).toBeTruthy();
            expect(user.interests.offerings).toEqual(expect.arrayContaining(testUser.interests.offering));
        }
    });

    test('57 – Seller signup auto-creates a Seller record in the database', async ({ request }) => {
        if (!newUserToken) test.skip();

        // The auto-created seller should appear in the sellers list
        const sellersRes = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${newUserToken}` },
        });

        expect(sellersRes.ok()).toBeTruthy();
        const body = await sellersRes.json();
        const autoCreatedSeller = body.sellers?.find(
            (s: { companyName: string }) => s.companyName === testUser.company
        );

        expect(autoCreatedSeller).toBeTruthy();
        expect(autoCreatedSeller?.companyName).toBe(testUser.company);
    });
});
