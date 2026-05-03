import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Activity from '@/models/Activity';

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
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}