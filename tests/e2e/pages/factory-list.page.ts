import { type Page, type Locator, expect } from '@playwright/test';
import { mockFactories, mockStats } from '../fixtures/mock-data';

export class FactoryListPage {
    readonly page: Page;
    // State for dynamic mocking
    private currentMockData: typeof mockFactories;

    readonly searchInput: Locator;
    readonly createButton: Locator;
    readonly factoryRows: Locator;

    // Dialog Locators
    readonly dialogTitle: Locator;
    readonly codeInput: Locator;
    readonly nameInput: Locator;
    readonly locationInput: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Initialize mock state with a deep copy
        this.currentMockData = JSON.parse(JSON.stringify(mockFactories));

        // Locators
        this.searchInput = page.getByPlaceholder(/Tìm.*nhà máy/i).first();
        this.createButton = page.getByRole('button', { name: /Thêm/i }).first();

        // Unified Row Locator (Desktop TR or Mobile Card)
        this.factoryRows = page.locator('tbody tr').or(page.locator('div[class*="transition-all"][class*="bg-card"]'));

        // Dialog/Drawer
        this.dialogTitle = page.getByRole('heading', { name: /Thêm Nhà máy mới|Chỉnh sửa Nhà máy/i });
        this.codeInput = page.locator('#code');
        this.nameInput = page.locator('#name');
        this.locationInput = page.locator('#location');
        this.saveButton = page.getByRole('button', { name: /Thêm mới|Lưu/i });
    }

    async goto() {
        await this.page.goto('/factories');
    }

    async mockApi() {
        // Mock List (GET)
        await this.page.route('**/api/factories?*', async (route) => {
            const url = new URL(route.request().url());
            const searchQuery = url.searchParams.get('search');

            // Fix param parsing (Empty array is truthy in JS)
            const s1 = url.searchParams.getAll('status');
            const s2 = url.searchParams.getAll('status[]');
            const statuses = s1.length > 0 ? s1 : s2;

            let filteredData = [...this.currentMockData.data];

            // Filter by Search
            if (searchQuery) {
                filteredData = filteredData.filter(f =>
                    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.code.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Filter by Status
            if (statuses.length > 0) {
                filteredData = filteredData.filter(f => statuses.includes(f.status)); // Expects ACTIVE/INACTIVE
            }

            const responseData = { ...this.currentMockData, data: filteredData, meta: { ...this.currentMockData.meta, total: filteredData.length } };

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(responseData),
            });
        });

        // Mock Stats
        await this.page.route('**/api/factories/stats', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockStats) });
        });

        // Mock Create (POST)
        await this.page.route('**/api/factories', async (route) => {
            if (route.request().method() === 'POST') {
                const payload = route.request().postDataJSON();
                const newFactory = {
                    id: String(new Date().getTime()),
                    code: payload.code,
                    name: payload.name,
                    location: payload.location || '',
                    status: 'ACTIVE',
                    equipmentCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                this.currentMockData.data.unshift(newFactory);
                this.currentMockData.meta.total++;
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newFactory) });
            } else {
                await route.continue();
            }
        });

        // Mock Update/Delete
        await this.page.route(/\/api\/factories\/[\w-]+$/, async (route) => {
            const method = route.request().method();
            const id = route.request().url().split('/').pop();

            if (method === 'PUT' || method === 'PATCH') {
                const payload = route.request().postDataJSON();
                const index = this.currentMockData.data.findIndex(f => f.id === id);
                if (index !== -1) {
                    // Update fields logic
                    this.currentMockData.data[index] = { ...this.currentMockData.data[index], ...payload };
                    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(this.currentMockData.data[index]) });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else if (method === 'DELETE') {
                const index = this.currentMockData.data.findIndex(f => f.id === id);
                if (index !== -1) {
                    this.currentMockData.data.splice(index, 1);
                    this.currentMockData.meta.total--;
                    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Deleted' }) });
                } else {
                    await route.fulfill({ status: 404 });
                }
            } else {
                await route.continue();
            }
        });
    }

    async search(query: string) {
        await expect(this.searchInput).toBeVisible();
        await this.searchInput.fill(query);
    }

    async filterByStatus(statusLabel: string) {
        // 1. Desktop / Visible Mobile chip
        const chipBtn = this.page.getByRole('button', { name: statusLabel });
        if (await chipBtn.first().isVisible()) {
            await chipBtn.first().click();
            return;
        }

        // 2. Mobile Drawer
        // Use robust selector for Filter Trigger (SVG inside Button)
        const mobileFilterTrigger = this.page.locator('button:has(svg.lucide-filter)').first();
        if (await mobileFilterTrigger.isVisible()) {
            await mobileFilterTrigger.click();
            await expect(this.page.getByRole('dialog')).toBeVisible();
            await this.page.getByRole('button', { name: statusLabel }).first().click();

            // Close drawer (Click X)
            // Use :has selector for SVG X
            const closeBtn = this.page.locator('button:has(svg.lucide-x)').last();
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            } else {
                await this.page.keyboard.press('Escape');
            }
        }
    }

    async openCreateDialog() {
        await this.createButton.click();
        await expect(this.dialogTitle).toBeVisible();
    }

    async fillForm(factory: { code: string; name: string; location?: string }) {
        await this.codeInput.fill(factory.code);
        await this.nameInput.fill(factory.name);
        if (factory.location) {
            await this.locationInput.fill(factory.location);
        }
        await this.saveButton.click();
    }

    async editFactory(name: string, newName: string) {
        const row = this.factoryRows.filter({ hasText: name }).first();
        // Use getByRole matching "Sửa" (Title or Text)
        // .filter({ hasText: /Sửa/i }) or name option
        await row.getByRole('button', { name: /Sửa/i }).click();

        await expect(this.dialogTitle).toBeVisible();
        await this.nameInput.fill(newName);
        // Wait for button to be enabled?
        await this.saveButton.click();
        // Wait for dialog close
        await expect(this.dialogTitle).not.toBeVisible();
    }

    async deleteFactory(name: string) {
        const row = this.factoryRows.filter({ hasText: name }).first();
        // Use getByRole matching "Xóa"
        await row.getByRole('button', { name: /Xóa/i }).click();

        // Confirm Dialog
        const alert = this.page.getByRole('alertdialog');
        await expect(alert).toBeVisible();
        await alert.getByRole('button', { name: /Xóa/i }).click();
        await expect(alert).not.toBeVisible();
    }
}
