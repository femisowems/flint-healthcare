import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Activity from '@/models/Activity';
import Candidate from '@/models/Candidate';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const activities = await Activity.find({ candidateId: params.id }).sort({ timestamp: -1 });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Ensure candidate exists
    const candidate = await Candidate.findById(params.id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const activity = await Activity.create({
      candidateId: params.id,
      actorName: body.actorName || 'Admin User',
      actorEmail: body.actorEmail || 'admin@flint.test',
      field: body.field,
      ...body,
    });
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
