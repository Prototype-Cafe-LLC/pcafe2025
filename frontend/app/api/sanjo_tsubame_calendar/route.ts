import { NextResponse } from 'next/server';
import { HOLIDAYS } from './holidays';

export async function GET() {
    return NextResponse.json(HOLIDAYS);
} 