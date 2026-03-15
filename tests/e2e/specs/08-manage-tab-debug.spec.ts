import { test, expect } from '@playwright/test';
import { AuthPage } from '../fixtures/pageObjects';

test('Manage tab debug for Bob Seller', async ({ page }) => {
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    });
    const auth = new AuthPage(page);
    await auth.login('seller'); // Login as Bob Seller

    // Navigate to profile
    const avatar = page.locator('header img[alt="Bob Seller"]');
    await avatar.click();
    await page.getByRole('button', { name: /My Profile/i }).click();

    // Wait for seller profile
    await page.waitForSelector('h1', { timeout: 10000 });

    // Click manage tab
    const manageTab = page.getByRole('button', { name: /Manage/i });
    if (await manageTab.isVisible()) {
        await manageTab.click();
    }

    // Wait to see if crash
    await page.waitForTimeout(2000);
});
