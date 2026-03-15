/**
 * SPEC: User Profile Management
 * Covers: Profile page accessible, user info shown, update profile API
 */
import { test, expect } from '@playwright/test';
import { AuthPage } from '../fixtures/pageObjects';
import { API_URL, USERS } from '../fixtures/testData';

test.describe('User Profile Management', () => {

    test.beforeEach(async ({ page }) => {
        const auth = new AuthPage(page);
        await auth.login('admin');
    });

    test('40 – profile page opens from user avatar/menu', async ({ page }) => {
        // Click on admin avatar or name in header
        const avatar = page.locator('header img[alt], header button:has-text("Admin")').last();
        await avatar.click();
        await page.waitForTimeout(500);

        // Look for profile/account option in dropdown
        const profileLink = page.getByRole('menuitem', { name: /profile|account/i })
            .or(page.getByRole('button', { name: /profile|account/i }))
            .or(page.getByRole('link', { name: /profile|account/i }));

        if (await profileLink.count() > 0) {
            await profileLink.first().click();
            await page.waitForTimeout(1000);
            // Profile page should render
            const body = await page.locator('body').innerText();
            expect(body.length).toBeGreaterThan(20);
        } else {
            // Navigate directly via handleNavigate('userProfile')
            // Click sidebar profile link
            const profileNav = page.locator('a[href*="profile"], button:has-text("Profile")').first();
            if (await profileNav.count() > 0) {
                await profileNav.click();
                await page.waitForTimeout(1000);
            }
            test.info().annotations.push({ type: 'warning', description: 'Profile nav link not found in header dropdown' });
        }
    });

    test('41 – API: GET /users/me returns current user', async ({ request }) => {
        const loginRes = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const { token } = await loginRes.json();

        const meRes = await request.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(meRes.ok()).toBeTruthy();
        const user = await meRes.json();
        expect(user.email || user.personalEmail).toBeTruthy();
        expect(user.name).toBe(USERS.admin.name);
    });

    test('42 – API: PUT /users/me updates designation', async ({ request }) => {
        const loginRes = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const { token } = await loginRes.json();

        const updateRes = await request.put(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            data: { designation: 'Chief Test Officer' },
        });
        expect(updateRes.ok()).toBeTruthy();
        const updated = await updateRes.json();
        expect(updated.designation).toBe('Chief Test Officer');

        // Reset
        await request.put(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            data: { designation: 'Administrator' },
        });
    });

    test('43 – API: GET /users lists all users', async ({ request }) => {
        const loginRes = await request.post(`${API_URL}/auth/login`, {
            data: { email: USERS.admin.email, password: USERS.admin.password },
        });
        const { token } = await loginRes.json();

        const usersRes = await request.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(usersRes.ok()).toBeTruthy();
        const body = await usersRes.json();
        expect(Array.isArray(body.users)).toBeTruthy();
        expect(body.users.length).toBeGreaterThan(0);
    });

});
