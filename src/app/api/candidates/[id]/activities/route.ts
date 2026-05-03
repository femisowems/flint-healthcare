import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Activity from '@/models/Activity';
import Candidate from '@/models/Candidate';

function isDemoId(id: string) {
  return id.startsWith('demo-');
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoId(params.id)) {
      const now = new Date().toISOString();
      return NextResponse.json([
        {
          _id: 'demo-act-1',
          type: 'note',
          actorName: 'Admin User',
          actorEmail: 'admin@flint.test',
          field: 'note',
          payload: { text: 'Demo candidate loaded from fallback data.' },
          timestamp: now,
          userId: 'system',
        },
        {
          _id: 'demo-act-2',
          type: 'assignment_change',
          actorName: 'Admin User',
          actorEmail: 'admin@flint.test',
          field: 'assignedRecruiter',
          payload: { summary: 'Assigned from demo seed data.' },
          timestamp: now,
          userId: 'system',
        },
      ]);
    }

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
    if (isDemoId(params.id)) {
      const body = await request.json();
      return NextResponse.json({
        _id: `demo-act-${Date.now()}`,
        candidateId: params.id,
        actorName: body.actorName || 'Admin User',
        actorEmail: body.actorEmail || 'admin@flint.test',
        field: body.field,
        payload: body.payload || body,
        type: body.type || 'note',
        timestamp: new Date().toISOString(),
        userId: 'system',
      }, { status: 201 });
    }

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
