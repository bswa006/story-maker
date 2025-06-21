import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openai_available: !!process.env.OPENAI_API_KEY,
    openai_length: process.env.OPENAI_API_KEY?.length || 0,
    replicate_available: !!process.env.REPLICATE_API_TOKEN,
    replicate_length: process.env.REPLICATE_API_TOKEN?.length || 0,
    openai_starts_with: process.env.OPENAI_API_KEY?.substring(0, 10) || 'none',
    replicate_starts_with: process.env.REPLICATE_API_TOKEN?.substring(0, 10) || 'none'
  });
}