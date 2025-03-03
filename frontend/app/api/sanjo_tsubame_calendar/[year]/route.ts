import { NextResponse } from 'next/server';
import { HOLIDAYS } from '../holidays';

export async function GET(
    request: Request,
    { params }: { params: { year: string } }
) {
    const { year } = params;

    if (!HOLIDAYS[year]) {
        return NextResponse.json(
            { error: `No holiday data available for year ${year}` },
            { status: 404 }
        );
    }

    return NextResponse.json({
        year,
        holidays: HOLIDAYS[year]
    });
} 