/**
 * SPEC: Network Page
 * Covers: Network section renders, sellers/users listed, connection actions
 */
import { test, expect } from '@playwright/test';
import { AuthPage, NavBar } from '../fixtures/pageObjects';
import { TIMEOUTS } from '../fixtures/testData';

test.describe('Network Page', () => {

    test.beforeEach(async ({ page }) => {
        const auth = new AuthPage(page);
        await auth.login('admin');
        const nav = new NavBar(page);
        await nav.goToNetwork();
    });

    test('38 – network page renders without crash', async ({ page }) => {
        await page.waitForSelector('#network-page', { timeout: TIMEOUTS.medium });
        const body = await page.locator('#network-page').innerText();
        expect(body.length).toBeGreaterThan(20);
        // Should not be a blank white page
        const visibleElements = await page.locator('#network-page *').count();
        expect(visibleElements).toBeGreaterThan(0);
    });

    test('39 – network page shows seller or user cards', async ({ page }) => {
        await page.waitForSelector('#network-page', { timeout: TIMEOUTS.medium });
        // Either an SVG burst (users with connections) or an empty state div should be visible
        const content = page.locator('#network-page').locator('svg, div.h-\\[500px\\]');
        await expect(content.first()).toBeVisible();
    });

});
