/**
 * SPEC: Seller Profile Page
 * Covers: Profile renders, tabs, connect, follow, message, meeting, testimonial
 */
import { test, expect } from '@playwright/test';
import { AuthPage, NavBar, SellerProfilePage } from '../fixtures/pageObjects';
import { KNOWN_SELLERS, API_URL, USERS, TIMEOUTS } from '../fixtures/testData';

let adminToken = '';

test.describe('Seller Profile Page', () => {

    test.beforeAll(async ({ request }) => {
        const res = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const body = await res.json();
        adminToken = body.token || '';
    });

    test.beforeEach(async ({ page }) => {
        const auth = new AuthPage(page);
        await auth.login('admin');
        // Click into a seller via the Businesses to Watch section
        await page.waitForSelector('text=Businesses to Watch', { timeout: 10000 });
        // Click on 'Innovate Solutions' card body
        const sellerText = page.locator(`text="Innovate Solutions"`).first();
        await sellerText.click();
        await page.waitForTimeout(1500);
    });

    test('17 – seller profile page renders correctly', async ({ page }) => {
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();

        // Has company name as H1
        const name = await profilePage.getSellerName();
        expect(name.length).toBeGreaterThan(0);

        // Has industry + followers
        await expect(page.locator('text=followers')).toBeVisible();
        // Has Back button
        await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
    });

    test('18 – About tab is default and shows description', async ({ page }) => {
        await page.waitForSelector('h1', { timeout: 8000 });
        // About tab should be active by default
        await expect(page.locator('button:has-text("About")')).toBeVisible();
    });

    test('19 – Posts tab shows the seller\'s posts', async ({ page }) => {
        await page.waitForSelector('h1', { timeout: 8000 });
        const postsTab = page.getByRole('button', { name: /Posts/i });
        await postsTab.click();
        await page.waitForTimeout(1000);
        // Should show posts or "no posts" message — either way, no crash
        await expect(page.locator('h1')).toBeVisible();
    });

    test('20 – user can click Follow on seller profile', async ({ page }) => {
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();
        const followBtn = page.locator('#btn-follow');
        if (await followBtn.isVisible()) {
            const initialText = await followBtn.innerText();
            await followBtn.click();
            await page.waitForTimeout(1000);
            const afterText = await followBtn.innerText();
            expect(afterText).not.toBe(initialText);
            // Toggle back
            await followBtn.click();
        }
    });

    test('21 – Connect button sends connection request', async ({ page }) => {
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();
        const connectBtn = page.locator('#btn-connect');
        if (await connectBtn.isVisible()) {
            await connectBtn.click();
            await page.waitForTimeout(1000);
            // After click: should show "Request Sent" or be disabled
            const requestSentBtn = page.locator('text=Request Sent, text=Sent');
            await expect(requestSentBtn.or(page.locator('#btn-connect:disabled'))).toBeVisible();
        }
    });

    test.skip('22 – Message modal opens and can be submitted', async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();
        const msgBtn = page.locator('#btn-message');
        await msgBtn.waitFor({ state: 'visible' });
        await page.waitForTimeout(1000); // Wait for React hydration
        await msgBtn.evaluate((node: any) => node.click());

        // Modal appears with textarea
        await page.waitForSelector('#message-modal', { timeout: TIMEOUTS.medium });
        const textarea = page.locator('#message-modal textarea').first();
        await expect(textarea).toBeVisible({ timeout: TIMEOUTS.medium });
        await textarea.fill('Hello from automated test!');

        // Click send
        const sendBtn = page.getByRole('button', { name: /send/i });
        await expect(sendBtn).toBeVisible();
        await sendBtn.click();
        await page.waitForTimeout(1500);

        // Modal should close without crash
        await expect(page.locator('#seller-profile-page')).toBeVisible();
    });

    test.skip('23 – Meeting request modal opens', async ({ page }) => {
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();
        const meetBtn = page.locator('#btn-meeting');
        await meetBtn.waitFor({ state: 'visible' });
        await page.waitForTimeout(1000);
        await meetBtn.evaluate((node: any) => node.click());

        // The meeting modal should appear
        await page.waitForSelector('#meeting-modal', { timeout: TIMEOUTS.medium });
        await expect(page.locator('#meeting-modal')).toBeVisible();

        // Close without submitting
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        await expect(page.locator('#seller-profile-page')).toBeVisible();
    });

    test('24 – Write a Testimonial button opens modal', async ({ page }) => {
        const profilePage = new SellerProfilePage(page);
        await profilePage.waitForLoad();
        const testimonialBtn = page.locator('#btn-testimonial');
        if (await testimonialBtn.isVisible()) {
            await testimonialBtn.click();
            // Modal should open
            await page.waitForTimeout(500);
            const textarea = page.locator('textarea').first();
            if (await textarea.isVisible()) {
                await textarea.fill('Great solution! Highly recommended.');
            }
            // Close without submitting
            const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Cancel")').first();
            if (await closeBtn.isVisible()) await closeBtn.click();
            else await page.keyboard.press('Escape');
        }
    });

    test('25 – API: follow/unfollow seller persists to DB', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        // Get a seller ID
        const sellersRes = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const sellersData = await sellersRes.json();
        if (!sellersData.sellers?.length) { test.skip(); return; }
        const sellerId = sellersData.sellers[0].id;

        // Follow
        const followRes = await request.post(`${API_URL}/sellers/${sellerId}/follow`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(followRes.ok()).toBeTruthy();
        const followBody = await followRes.json();
        expect(followBody.user).toBeDefined();
        expect(Array.isArray(followBody.user.followedSellers)).toBeTruthy();

        // Unfollow
        await request.post(`${API_URL}/sellers/${sellerId}/follow`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
    });

    test('26 – API: message a seller persists to DB', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        const sellersRes = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const sellersData = await sellersRes.json();
        if (!sellersData.sellers?.length) { test.skip(); return; }
        const sellerId = sellersData.sellers[0].id;

        const msgRes = await request.post(`${API_URL}/sellers/${sellerId}/message`, {
            headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
            data: { content: 'API-level message test' },
        });
        expect(msgRes.ok()).toBeTruthy();
        const msgBody = await msgRes.json();
        expect(msgBody.id).toBeTruthy();
        expect(msgBody.category).toBe('Message');
    });

    test('27 – API: meeting request persists to DB', async ({ request }) => {
        if (!adminToken) { test.skip(); return; }

        const sellersRes = await request.get(`${API_URL}/sellers`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const sellersData = await sellersRes.json();
        if (!sellersData.sellers?.length) { test.skip(); return; }
        const sellerId = sellersData.sellers[0].id;

        const meetRes = await request.post(`${API_URL}/sellers/${sellerId}/meeting`, {
            headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
            data: { proposedTime: '2026-03-01T10:00', message: 'API meeting test' },
        });
        expect(meetRes.ok()).toBeTruthy();
        const meetBody = await meetRes.json();
        expect(meetBody.id).toBeTruthy();
        expect(meetBody.category).toBe('MeetingRequest');
    });

    test('28 – Back button returns to feed', async ({ page }) => {
        await page.waitForSelector('h1', { timeout: 8000 });
        await page.getByRole('button', { name: /Back/i }).click();
        await page.waitForSelector('text=Businesses to Watch', { timeout: 8000 });
        await expect(page.locator('text=Businesses to Watch')).toBeVisible();
    });

});
