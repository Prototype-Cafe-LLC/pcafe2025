import { NextResponse } from 'next/server';

// 日付のバリデーション
function isValidDate(year: number, month: number, date: number): boolean {
    const d = new Date(year, month - 1, date);
    return d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === date;
}

// 2025年の休業日
const HOLIDAYS_2025 = [
    '2025-01-01', // 元日
    '2025-01-13', // 成人の日
    '2025-02-11', // 建国記念の日
    '2025-02-23', // 天皇誕生日
    '2025-02-24', // 天皇誕生日 振替休日
    '2025-03-21', // 春分の日
    '2025-04-29', // 昭和の日
    '2025-05-03', // 憲法記念日
    '2025-05-04', // みどりの日
    '2025-05-05', // こどもの日
    '2025-05-06', // こどもの日 振替休日
    '2025-07-21', // 海の日
    '2025-08-11', // 山の日
    '2025-09-15', // 敬老の日
    '2025-09-23', // 秋分の日
    '2025-10-13', // スポーツの日
    '2025-11-03', // 文化の日
    '2025-11-23', // 勤労感謝の日
    '2025-11-24', // 勤労感謝の日 振替休日
    '2025-12-23', // 天皇誕生日
];

// 営業状態を判定する関数
function getBusinessStatus(year: number, month: number, date: number): 'on' | 'off' | 'undefined' {
    // 2025年以外はundefined
    if (year !== 2025) {
        return 'undefined';
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

    // 土日判定
    const d = new Date(year, month - 1, date);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // 休業日判定
    if (isWeekend || HOLIDAYS_2025.includes(dateStr)) {
        return 'off';
    }

    return 'on';
}

export async function GET(
    request: Request,
    { params }: { params: { year: string; month: string; date: string } }
) {
    const year = parseInt(params.year, 10);
    const month = parseInt(params.month, 10);
    const date = parseInt(params.date, 10);

    // 日付のバリデーション
    if (!isValidDate(year, month, date)) {
        return NextResponse.json(
            { error: '無効な日付です' },
            { status: 400 }
        );
    }

    // 営業状態を取得
    const status = getBusinessStatus(year, month, date);

    return NextResponse.json({ status });
} 