import { test, expect } from '@playwright/test';
import { FactoryListPage } from '../pages/factory-list.page';

test.describe('Factory List Feature', () => {
    let factoryPage: FactoryListPage;

    test.beforeEach(async ({ page }) => {
        factoryPage = new FactoryListPage(page);
        await factoryPage.mockApi();
        await factoryPage.goto();
    });

    test('should display list of factories', async ({ page }) => {
        await expect(page.getByText('Factory One')).toBeVisible();
        await expect(page.getByText('Factory Two')).toBeVisible();
    });

    test('should filter factories by search', async ({ page }) => {
        const searchPromise = page.waitForResponse(resp =>
            resp.url().includes('search=') && resp.status() === 200
        );

        await factoryPage.search('Factory One');
        await searchPromise;

        await expect(page.getByText('Factory One')).toBeVisible();
        await expect(page.getByText('Factory Two')).not.toBeVisible();
    });

    test('should filter factories by status', async ({ page }) => {
        // Factory One is ACTIVE. Factory Two is INACTIVE.
        // Filter by Active
        await factoryPage.filterByStatus('Hoạt động');

        // Wait for list update (mocked)
        await expect(page.getByText('Factory One')).toBeVisible();
        await expect(page.getByText('Factory Two')).not.toBeVisible();

        // Toggle off (Clear) -> Show All
        await factoryPage.filterByStatus('Hoạt động');
        await expect(page.getByText('Factory Two')).toBeVisible();

        // Now filter by Inactive
        await factoryPage.filterByStatus('Ngừng hoạt động');
        await expect(page.getByText('Factory One', { exact: true })).not.toBeVisible();
        await expect(page.getByText('Factory Two')).toBeVisible();
    });

    test('should create a new factory', async ({ page }) => {
        await factoryPage.openCreateDialog();

        await factoryPage.fillForm({
            code: 'F99',
            name: 'New Factory',
            location: 'Test Location'
        });

        await expect(factoryPage.dialogTitle).not.toBeVisible();

        // Verify item appears in the list
        await expect(page.getByText('F99')).toBeVisible();
        await expect(page.getByText('New Factory')).toBeVisible();
    });

    test('should update a factory', async ({ page }) => {
        // Allow edit on "Factory One"
        await factoryPage.editFactory('Factory One', 'Factory One Updated');

        // Verify changes in list
        // Use exact match to avoid matching "Factory One Updated" when checking "Factory One" visibility
        await expect(page.getByText('Factory One Updated')).toBeVisible();
        await expect(page.getByText('Factory One', { exact: true })).not.toBeVisible();
    });

    test('should delete a factory', async ({ page }) => {
        // Delete "Factory Two"
        await factoryPage.deleteFactory('Factory Two');

        // Verify removal
        await expect(page.getByText('Factory Two')).not.toBeVisible();
    });

    test('should display empty state', async ({ page }) => {
        await page.route('**/api/factories?*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: [], meta: { total: 0 } }),
            });
        });

        await factoryPage.goto();
        await expect(page.getByText('Chưa có nhà máy nào')).toBeVisible();
    });
});
