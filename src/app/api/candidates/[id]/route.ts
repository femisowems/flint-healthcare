import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Candidate from '@/models/Candidate';
import Activity from '@/models/Activity';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const candidate = await Candidate.findById(params.id);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Check if stage is changing, to log it
    const existingCandidate = await Candidate.findById(params.id);
    if (existingCandidate && body.stage && existingCandidate.stage !== body.stage) {
      await Activity.create({
        candidateId: existingCandidate._id,
        type: 'stage_change',
        payload: {
          from: existingCandidate.stage,
          to: body.stage,
        },
      });
    }

    const candidate = await Candidate.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}
