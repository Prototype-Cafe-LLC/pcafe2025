import { NextResponse } from 'next/server';
import { HOLIDAYS } from '../../holidays';

export async function GET(
    request: Request,
    { params }: { params: { year: string; month: string } }
) {
    const { year, month } = params;

    if (!HOLIDAYS[year]) {
        return NextResponse.json(
            { error: `No holiday data available for year ${year}` },
            { status: 404 }
        );
    }

    if (!HOLIDAYS[year][month]) {
        return NextResponse.json(
            { error: `No holiday data available for month ${month} in year ${year}` },
            { status: 404 }
        );
    }

    return NextResponse.json({
        year,
        month,
        holidays: HOLIDAYS[year][month]
    });
} 