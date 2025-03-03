import { test, expect } from '@playwright/test';

test.describe('三条燕カレンダーAPI', () => {
    test('特定の日付の営業状態を取得できる', async ({ request }) => {
        const response = await request.get('/api/sanjo_tsubame_calendar/2023/12/25');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data).toHaveProperty('status');
        expect(['on', 'off', 'undefined']).toContain(data.status);
    });

    test('無効な日付の場合はエラーを返す', async ({ request }) => {
        const response = await request.get('/api/sanjo_tsubame_calendar/2023/13/32');
        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('error');
    });

    test('2025年の営業日を取得できる', async ({ request }) => {
        const dates = [
            '2025/01/01',
            '2025/05/05',
            '2025/08/15',
            '2025/12/25'
        ];

        for (const date of dates) {
            const [year, month, day] = date.split('/');
            const response = await request.get(`/api/sanjo_tsubame_calendar/${year}/${month}/${day}`);
            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            expect(data).toHaveProperty('status');
            expect(['on', 'off', 'undefined']).toContain(data.status);
        }
    });
}); 