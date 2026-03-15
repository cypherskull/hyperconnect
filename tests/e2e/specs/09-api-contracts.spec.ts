/**
 * SPEC: Backend API — Core endpoints contract tests
 * Pure API tests with no browser; validates status codes, shapes, auth guards
 */
import { test, expect } from '@playwright/test';
import { API_URL, USERS } from '../fixtures/testData';

let token = '';
let sellerId = '';
let postId = '';

test.describe('Backend API Contract Tests', () => {

    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const body = await res.json();
        token = body.token || '';

        if (token) {
            const sellersRes = await request.get(`${API_URL}/sellers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sellersBody = await sellersRes.json();
            sellerId = sellersBody.sellers?.[0]?.id || '';

            const postsRes = await request.get(`${API_URL}/posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const postsBody = await postsRes.json();
            postId = postsBody.posts?.[0]?.id || '';
        }
    });

    // ─── AUTH ────────────────────────────────────────────────────────────────

    test('44 – POST /auth/login returns token and user', async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.token).toBeTruthy();
        expect(body.user).toBeTruthy();
        expect(body.user.email).toBe(USERS.admin.email);
    });

    test('45 – POST /auth/login rejects invalid credentials', async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/login`, {
            data: { email: 'nobody@test.com', password: 'badpass' },
        });
        expect(res.status()).toBe(401);
    });

    test('46 – GET /auth/verify validates a live token', async ({ request }) => {
        if (!token) { test.skip(); return; }
        const res = await request.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
    });

    test('47 – GET /auth/verify rejects bad token', async ({ request }) => {
        const res = await request.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer fake.token.here` },
        });
        expect(res.status()).toBe(401);
    });

    // ─── SELLERS ─────────────────────────────────────────────────────────────

    test('48 – GET /sellers returns paginated list', async ({ request }) => {
        const res = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(Array.isArray(body.sellers)).toBeTruthy();
        expect(body.pagination).toBeTruthy();
        expect(body.pagination.total).toBeGreaterThan(0);
    });

    test('49 – GET /sellers/:id returns detailed seller', async ({ request }) => {
        if (!sellerId) { test.skip(); return; }
        const res = await request.get(`${API_URL}/sellers/${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.id).toBe(sellerId);
        expect(body.companyName).toBeTruthy();
        expect(Array.isArray(body.solutions)).toBeTruthy();
    });

    test('50 – GET /sellers/:id returns 404 for unknown id', async ({ request }) => {
        const res = await request.get(`${API_URL}/sellers/nonexistent-id-xyz`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status()).toBe(404);
    });

    // ─── POSTS ───────────────────────────────────────────────────────────────

    test('51 – GET /posts returns paginated posts with isLiked/isBookmarked', async ({ request }) => {
        if (!token) { test.skip(); return; }
        const res = await request.get(`${API_URL}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(Array.isArray(body.posts)).toBeTruthy();
        if (body.posts.length > 0) {
            expect(typeof body.posts[0].isLiked).toBe('boolean');
            expect(typeof body.posts[0].isBookmarked).toBe('boolean');
        }
    });

    test('52 – POST /posts creates a new post', async ({ request }) => {
        if (!token || !sellerId) { test.skip(); return; }

        // Get a solution ID
        const sellersRes = await request.get(`${API_URL}/sellers/${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const sellerBody = await sellersRes.json();
        const solutionId = sellerBody.solutions?.[0]?.id;
        if (!solutionId) { test.skip(); return; }

        const createRes = await request.post(`${API_URL}/posts`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            data: {
                title: 'Automated Test Post',
                content: 'This post was created by the test suite.',
                sellerId,
                solutionId,
            },
        });
        expect(createRes.status()).toBe(201);
        const post = await createRes.json();
        expect(post.id).toBeTruthy();
        expect(post.title).toBe('Automated Test Post');

        // Cleanup
        await request.delete(`${API_URL}/posts/${post.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    });

    test('53 – GET /posts?sellerId filters by seller', async ({ request }) => {
        if (!token || !sellerId) { test.skip(); return; }
        const res = await request.get(`${API_URL}/posts?sellerId=${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        for (const post of body.posts ?? []) {
            expect(post.sellerId).toBe(sellerId);
        }
    });

    // ─── HEALTH ─────────────────────────────────────────────────────────────

    test('54 – GET /health returns ok', async ({ request }) => {
        const rootUrl = API_URL.split('/api')[0];
        const res = await request.get(`${rootUrl}/api/health`);
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        expect(body.status).toBe('ok');
    });

});
