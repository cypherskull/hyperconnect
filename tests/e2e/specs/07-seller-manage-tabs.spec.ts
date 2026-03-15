import { test, expect } from '@playwright/test';
import { AuthPage } from '../fixtures/pageObjects';

test.describe('Seller Owner Profile View', () => {
    test.beforeEach(async ({ page }) => {
        const auth = new AuthPage(page);
        await auth.login('seller'); // Logs in as Bob (Innovate Solutions)

        // Navigate to own profile via avatar -> My Profile -> Manage Content
        const avatar = page.locator('img[alt="Bob Seller"]');
        await avatar.waitFor({ state: 'visible', timeout: 10000 });
        await avatar.click();

        await page.getByRole('button', { name: 'My Profile' }).click();

        // From User Profile, navigate to Seller Profile Manage tab
        const manageContentBtn = page.getByRole('button', { name: /Manage Content/i });
        await manageContentBtn.waitFor({ state: 'visible', timeout: 10000 });
        await manageContentBtn.click();

        // Wait for profile to load
        await page.waitForSelector('h1:has-text("Innovate Solutions")', { timeout: 10000 });
    });

    test('01 – All seller profile tabs load successfully without crashing', async ({ page }) => {
        // Test About Tab (Default)
        await expect(page.locator('text=Leading provider of AI-driven')).toBeVisible({ timeout: 5000 });

        // Test Posts Tab
        const postsTab = page.getByRole('button', { name: /Posts \(/i });
        await postsTab.waitFor({ state: 'visible' });
        await page.waitForTimeout(500); // Wait for React
        await postsTab.click();
        await expect(page.locator('text=Loading posts...').or(page.locator('button:has-text("Like")').first())).toBeVisible({ timeout: 5000 });

        // Test Investment Tab
        const invstTab = page.getByRole('button', { name: 'Investment' });
        if (await invstTab.isVisible()) {
            await invstTab.click();
            await page.waitForTimeout(1000);
            // Just verify the page didn't crash after clicking Investment tab
            await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
        }

        // Test Manage Tab
        const manageTab = page.getByRole('button', { name: 'Manage' });
        await manageTab.waitFor({ state: 'visible' });
        await page.waitForTimeout(500);
        await manageTab.click();

        // Verify it doesn't give a blank page and shows content management
        await expect(page.locator('h2:has-text("Content Management")')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('button:has-text("Add New Solution")')).toBeVisible();

        // Test Analytics Tab
        const analyticsTab = page.getByRole('button', { name: 'Analytics' });
        await analyticsTab.click();
        await expect(page.locator('h3:has-text("Audience Breakdown")')).toBeVisible();
    });

    test('02 – Manage tab link interactions do not crash', async ({ page }) => {
        // Go to Manage Tab
        const manageTab = page.getByRole('button', { name: 'Manage' });
        await manageTab.waitFor({ state: 'visible' });
        await page.waitForTimeout(500);
        await manageTab.click();

        await expect(page.locator('h2:has-text("Content Management")')).toBeVisible({ timeout: 8000 });

        // Click Add New Solution
        await page.getByRole('button', { name: 'Add New Solution' }).click();
        await expect(page.locator('h2:has-text("Add New Solution")')).toBeVisible({ timeout: 8000 });
        await page.getByRole('button', { name: 'Cancel' }).click();

        // Test inner tabs
        await page.getByRole('button', { name: 'Collateral' }).click();
        await expect(page.getByRole('button', { name: 'Upload Collateral' })).toBeVisible();

        await page.getByRole('button', { name: 'Case Studies' }).click();
        await expect(page.getByRole('button', { name: 'Add Case Study' })).toBeVisible();

        await page.getByRole('button', { name: 'Podcasts' }).click();
        await expect(page.getByRole('button', { name: 'Upload Podcast Audio' })).toBeVisible();

        await page.getByRole('button', { name: 'Events' }).click();
        await expect(page.getByRole('button', { name: 'Host New Event' })).toBeVisible();
    });
});
