import { Page, expect } from '@playwright/test';
import { USERS, TIMEOUTS } from '../fixtures/testData';

type UserKey = keyof typeof USERS;

/**
 * Page Object: Authentication flows
 */
export class AuthPage {
    constructor(private page: Page) { }

    async login(userKey: UserKey = 'admin') {
        const user = USERS[userKey];
        await this.page.goto('/');
        await this.page.waitForSelector('input[type="email"]', { timeout: TIMEOUTS.medium });

        // Clear localStorage to avoid stale token crashes
        await this.page.evaluate(() => localStorage.clear());
        await this.page.reload();
        await this.page.waitForSelector('input[type="email"]', { timeout: TIMEOUTS.medium });

        await this.page.fill('input[type="email"]', user.email);
        await this.page.fill('input[type="password"]', user.password);
        await this.page.click('button[type="submit"]');

        // Wait for feed to appear (means login worked)
        await this.page.waitForSelector('h2', { timeout: TIMEOUTS.long });
        // Wait for Header to be ready (at least one nav item)
        await this.page.waitForSelector('header', { timeout: TIMEOUTS.medium });
        await expect(this.page.locator('h2').first()).toBeVisible();
    }

    async logout() {
        // Toggle profile dropdown
        await this.page.locator('header img[alt]').last().click();
        const logoutBtn = this.page.getByRole('button', { name: /log out/i });
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
        } else {
            // fallback: clear storage and reload
            await this.page.evaluate(() => localStorage.clear());
            await this.page.goto('/');
        }
        await this.page.waitForSelector('input[type="email"]', { timeout: TIMEOUTS.medium });
    }

    async isLoggedIn(): Promise<boolean> {
        return this.page.locator('input[type="email"]').count().then(n => n === 0);
    }
}

/**
 * Page Object: Feed page
 */
export class FeedPage {
    constructor(private page: Page) { }

    async waitForLoad() {
        await this.page.waitForSelector('text=Businesses to Watch', { timeout: TIMEOUTS.long });
    }

    async getFirstPostCard() {
        return this.page.locator('[data-testid="post-card"], .post-card, article').first();
    }

    async clickFirstSellerCard(sellerName?: string) {
        if (sellerName) {
            // Click specific seller card body (not buttons)
            const card = this.page.locator(`text="${sellerName}"`).first();
            await card.click();
        } else {
            // Click first card in "Businesses to Watch"
            const section = this.page.locator('text=Businesses to Watch').locator('..').locator('..');
            await section.locator('img').first().click();
        }
        await this.page.waitForTimeout(1000);
    }

    async likeFirstPost() {
        // Find a like button in the Latest Updates / PostFeed area
        const likeBtn = this.page.locator('button[aria-label*="Like"], button[title*="Like"]').first();
        await likeBtn.waitFor({ timeout: TIMEOUTS.medium });
        const before = await likeBtn.textContent();
        await likeBtn.click();
        return before;
    }

    async bookmarkFirstPost() {
        const bookmarkBtn = this.page.locator('button[aria-label*="Bookmark"], button[aria-label*="bookmark"], button[title*="Bookmark"]').first();
        await bookmarkBtn.waitFor({ timeout: TIMEOUTS.medium });
        await bookmarkBtn.click();
    }

    async openFirstPostComments() {
        const commentBtn = this.page.locator('button[aria-label*="Comment"], button[aria-label*="comment"]').first();
        await commentBtn.waitFor({ timeout: TIMEOUTS.medium });
        await commentBtn.click();
        // Wait for comment modal
        await this.page.waitForSelector('textarea, input[placeholder*="comment" i]', { timeout: TIMEOUTS.medium });
    }

    async connectToFirstSeller() {
        const connectBtn = this.page.locator('button[aria-label="Connect with Seller"]').first();
        await connectBtn.waitFor({ timeout: TIMEOUTS.medium });
        await connectBtn.click();
    }

    async messageSeller() {
        const msgBtn = this.page.locator('button[aria-label="Message Seller"]').first();
        await msgBtn.waitFor({ timeout: TIMEOUTS.medium });
        await msgBtn.click();
        await this.page.waitForSelector('textarea, input[placeholder*="message" i]', { timeout: TIMEOUTS.medium });
    }

    async meetSeller() {
        const meetBtn = this.page.locator('button[aria-label="Request Meeting"]').first();
        await meetBtn.waitFor({ timeout: TIMEOUTS.medium });
        await meetBtn.click();
        await this.page.waitForSelector('input[type="datetime-local"], input[placeholder*="time" i]', { timeout: TIMEOUTS.medium });
    }
}

/**
 * Page Object: Seller profile page
 */
export class SellerProfilePage {
    constructor(private page: Page) { }

    async waitForLoad() {
        await this.page.waitForSelector('h1', { timeout: TIMEOUTS.long });
        // must have a back button
        await this.page.waitForSelector('button:has-text("Back")', { timeout: TIMEOUTS.medium });
    }

    async getSellerName(): Promise<string> {
        return this.page.locator('h1').first().innerText();
    }

    async clickTab(name: 'About' | 'Posts' | 'Manage' | 'Analytics' | 'Investment') {
        await this.page.getByRole('button', { name, exact: true }).click();
        await this.page.waitForTimeout(500);
    }

    async sendConnectionRequest() {
        const btn = this.page.locator('#btn-connect');
        if (await btn.isVisible()) {
            await btn.click();
            await this.page.waitForTimeout(500);
        }
    }

    async sendMessage(text: string) {
        await this.page.locator('#btn-message').click();
        await this.page.waitForSelector('textarea', { timeout: TIMEOUTS.medium });
        await this.page.fill('textarea', text);
        await this.page.getByRole('button', { name: /send/i }).click();
        await this.page.waitForTimeout(1000);
    }

    async requestMeeting(proposedTime: string, message: string) {
        await this.page.locator('#btn-meeting').click();
        // Fill in datetime-local or text input
        const dtInput = this.page.locator('input[type="datetime-local"]').first();
        if (await dtInput.isVisible()) {
            await dtInput.fill(proposedTime);
        }
        const msgArea = this.page.locator('textarea').first();
        if (await msgArea.isVisible()) {
            await msgArea.fill(message);
        }
        await this.page.getByRole('button', { name: /send|submit|request/i }).last().click();
        await this.page.waitForTimeout(1000);
    }

    async writeTestimonial(text: string, score: number = 4) {
        await this.page.locator('#btn-testimonial').click();
        await this.page.waitForSelector('textarea', { timeout: TIMEOUTS.medium });
        await this.page.fill('textarea', text);
        // click star ratings if present
        const stars = this.page.locator('button[aria-label*="star" i], [role="radio"]');
        const count = await stars.count();
        if (count > 0) {
            // click score-th star for each category
            for (let i = 0; i < Math.min(count, 5); i++) {
                await stars.nth(i).click();
            }
        }
        await this.page.getByRole('button', { name: /submit|save/i }).last().click();
        await this.page.waitForTimeout(1000);
    }

    async followSeller() {
        const btn = this.page.locator('#btn-follow');
        await btn.click();
        await this.page.waitForTimeout(500);
    }

    async goBack() {
        await this.page.getByRole('button', { name: /Back/i }).click();
        await this.page.waitForTimeout(500);
    }
}

/**
 * Page Object: Navigation bar
 */
export class NavBar {
    constructor(private page: Page) { }

    async goToFeed() {
        await this.page.locator('#nav-home').click();
        await this.page.waitForTimeout(500);
    }

    async goToInbox() {
        await this.page.waitForSelector('#nav-inbox', { timeout: TIMEOUTS.medium });
        await this.page.locator('#nav-inbox').click();
        await this.page.waitForSelector('#inbox-heading', { timeout: TIMEOUTS.medium });
    }

    async goToNetwork() {
        await this.page.waitForSelector('#nav-network', { timeout: TIMEOUTS.medium });
        await this.page.locator('#nav-network').click();
        await this.page.waitForSelector('#network-page', { timeout: TIMEOUTS.medium });
    }

    async goToFavourites() {
        await this.page.locator('#nav-favourites').click();
        await this.page.waitForTimeout(500);
    }

    async goToProfile() {
        await this.page.locator('header').getByRole('button', { name: /admin/i }).hover();
        const profileLink = this.page.getByRole('link', { name: /profile|account/i });
        if (await profileLink.isVisible()) {
            await profileLink.click();
        } else {
            // Some apps use avatar click
            await this.page.locator('header img[alt]').last().click();
        }
        await this.page.waitForTimeout(500);
    }
}
