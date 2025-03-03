import { NextResponse } from 'next/server';
import { getBusinessStatus } from '../holidays';

export async function GET(
    request: Request,
    { params }: { params: { slug: string[] } }
) {
    console.log('Received params:', params.slug); // デバッグ用

    const [year, month, date] = params.slug;

    if (!year || !month || !date) {
        return NextResponse.json(
            { error: 'Invalid parameters. Use format: /year/month/date' },
            { status: 400 }
        );
    }

    // 数値に変換
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dateNum = parseInt(date);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dateNum)) {
        return NextResponse.json(
            { error: 'Year, month, and date must be numbers' },
            { status: 400 }
        );
    }

    // 営業状態を取得
    const status = getBusinessStatus(year, month, date);

    return NextResponse.json({
        year: yearNum,
        month: monthNum,
        date: dateNum,
        status
    });
} 