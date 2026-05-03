import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Activity from '@/models/Activity';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(Number.isNaN(limit) ? 10 : limit)
      .populate('candidateId', 'name stage updatedAt');

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    // Fallback demo activities when DB is unavailable
    const now = new Date().toISOString();
    const demo = [
      { _id: 'act-demo-1', type: 'note', summary: 'Candidate applied', timestamp: now, candidateId: { _id: 'demo-1', name: 'Asha Patel', stage: 'Applied' } },
      { _id: 'act-demo-2', type: 'assignment_change', summary: 'Assigned to Admin User', timestamp: now, candidateId: { _id: 'demo-3', name: 'Maria Gonzalez', stage: 'Interview' } },
    ];

    return NextResponse.json(demo);
  }
}