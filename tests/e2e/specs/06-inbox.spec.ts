/**
 * SPEC: Inbox page
 * Covers: Inbox renders, items display, can navigate to inbox
 */
import { test, expect } from '@playwright/test';
import { AuthPage, NavBar } from '../fixtures/pageObjects';
import { API_URL, USERS, TIMEOUTS } from '../fixtures/testData';

test.describe('Inbox', () => {

    test.beforeEach(async ({ page }) => {
        const auth = new AuthPage(page);
        await auth.login('admin');
    });

    test('33 – inbox page is accessible from nav bar', async ({ page }) => {
        const nav = new NavBar(page);
        await nav.goToInbox();
        await expect(page.locator('#inbox-heading')).toBeVisible();
    });

    test('34 – inbox lists connection requests', async ({ page }) => {
        const nav = new NavBar(page);
        await nav.goToInbox();

        // Switch to connection request tab
        const connTab = page.locator('#inbox-tab-connectionrequest');
        if (await connTab.isVisible()) {
            await connTab.click();
            await page.waitForTimeout(1000);

            // Check for items or empty state
            const items = page.locator('.inbox-item-card');
            const empty = page.locator('text=No items in this category');
            await expect(items.or(empty)).toBeVisible();
        }
    });

    test('35 – inbox shows message category items', async ({ page }) => {
        const nav = new NavBar(page);
        await nav.goToInbox();

        // Check if message tab exists and is clickable
        const msgTab = page.locator('#inbox-tab-message');
        if (await msgTab.isVisible()) {
            await msgTab.click();
            await page.waitForTimeout(1000);
            const items = page.locator('.inbox-item-card');
            const empty = page.locator('text=No items in this category');
            await expect(items.or(empty)).toBeVisible();
        }
    });

    test('36 – API: inbox returns items for authenticated user', async ({ request }) => {
        const loginRes = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const { token } = await loginRes.json();

        const inboxRes = await request.get(`${API_URL}/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(inboxRes.ok()).toBeTruthy();
        const body = await inboxRes.json();
        expect(Array.isArray(body.inboxItems)).toBeTruthy();
    });

    test('37 – API: inbox requires authentication', async ({ request }) => {
        const inboxRes = await request.get(`${API_URL}/inbox`);
        expect(inboxRes.status()).toBe(401);
    });

});
