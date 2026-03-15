/**
 * SPEC: Connection Requests
 * Covers: Send, persist to DB, appear in inbox, prevent duplicates
 */
import { test, expect } from '@playwright/test';
import { API_URL, USERS } from '../fixtures/testData';

let adminToken = '';

test.describe('Connection Requests', () => {

    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        adminToken = (await res.json()).token || '';
    });

    test('29 – API: connection request is saved to DB', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        const sellersRes = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const { sellers } = await sellersRes.json();
        if (!sellers?.length) { test.skip(); return; }

        const sellerId = sellers[0].id;

        // Clean: archive any existing pending requests first by checking inbox
        const inboxBefore = await (await request.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        })).json();

        for (const item of inboxBefore.inboxItems ?? []) {
            if (item.category === 'ConnectionRequest' && item.status === 'Pending' && item.relatedSellerId === sellerId) {
                await request.patch(`${API_URL}/inbox/${item.id}/archive`, {
                    headers: { Authorization: `Bearer ${adminToken}` },
                });
            }
        }

        // Send new request
        const connRes = await request.post(`${API_URL}/inbox/connection`, {
            headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
            data: { entityId: sellerId },
        });
        expect(connRes.ok()).toBeTruthy();
        const connBody = await connRes.json();
        expect(connBody.id).toBeTruthy();
        expect(connBody.category).toBe('ConnectionRequest');
        expect(connBody.status).toBe('Pending');
    });

    test('30 – API: inbox returns the connection request after sending', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        const inboxRes = await request.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(inboxRes.ok()).toBeTruthy();
        const { inboxItems } = await inboxRes.json();
        const connRequests = (inboxItems ?? []).filter(
            (i: any) => i.category === 'ConnectionRequest'
        );
        expect(connRequests.length).toBeGreaterThan(0);
    });

    test('31 – API: duplicate connection request returns 409', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        // Find an existing pending connection request
        const inboxRes = await request.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const { inboxItems } = await inboxRes.json();
        const pending = (inboxItems ?? []).find(
            (i: any) => i.category === 'ConnectionRequest' && i.status === 'Pending'
        );
        if (!pending) { test.skip(); return; }

        // Try to send another request to the same entity
        const dupeRes = await request.post(`${API_URL}/inbox/connection`, {
            headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
            data: { entityId: pending.relatedSellerId },
        });
        expect(dupeRes.status()).toBe(409);
    });

    test('32 – API: inbox item can be archived', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        const inboxRes = await request.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const { inboxItems } = await inboxRes.json();
        if (!inboxItems?.length) { test.skip(); return; }

        const itemId = inboxItems[0].id;
        const archiveRes = await request.patch(`${API_URL}/inbox/${itemId}/archive`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(archiveRes.ok()).toBeTruthy();
        const archived = await archiveRes.json();
        expect(archived.status).toBe('Archived');
    });

});
