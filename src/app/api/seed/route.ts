import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Candidate from '@/models/Candidate';
import Activity, { IActivity } from '@/models/Activity';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const headerSecret = request.headers.get('x-seed-secret');
  const urlSecret = new URL(request.url).searchParams.get('secret');
  const secret = headerSecret || urlSecret;

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const now = new Date().toISOString();

    const sampleCandidates = [
      {
        name: 'Asha Patel', country: 'India', stage: 'Applied', tags: ['RN', 'ICU'],
        assignedRecruiter: 'Admin User', assignedRecruiterEmail: 'admin@flint.test', experience: 5,
        specialization: 'Critical Care', documents: { resume: { received: true, updatedAt: now } },
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Mohammed Ali', country: 'Egypt', stage: 'Screening', tags: ['RN', 'Pediatrics'],
        experience: 3, specialization: 'Pediatrics', documents: { resume: { received: false } },
        createdAt: now, updatedAt: now,
      },
      {
        name: 'Maria Gonzalez', country: 'Philippines', stage: 'Interview', tags: ['RN', 'ER'],
        assignedRecruiter: 'Admin User', assignedRecruiterEmail: 'admin@flint.test', experience: 7,
        specialization: 'Emergency', documents: { resume: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now } },
        createdAt: now, updatedAt: now,
      },
    ];

    const createdCandidates = await Candidate.create(sampleCandidates) as Array<{ _id: mongoose.Types.ObjectId; name: string; assignedRecruiter?: string }>;

    const activities: Partial<IActivity>[] = [];
    createdCandidates.forEach((c) => {
      activities.push({ type: 'note', payload: { summary: `${c.name} profile created` }, timestamp: new Date(now), candidateId: new mongoose.Types.ObjectId(String(c._id)) });
      activities.push({ type: 'assignment_change', payload: { summary: `Assigned to ${c.assignedRecruiter || 'unassigned'}` }, timestamp: new Date(now), candidateId: new mongoose.Types.ObjectId(String(c._id)) });
    });

    // create activities - Mongoose create typing is permissive but strict lint flags 'any' here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdActivities = await Activity.create(activities as any[]);

    return NextResponse.json({ insertedCandidates: createdCandidates.length, insertedActivities: createdActivities.length });
  } catch (error) {
    console.error('Seed failed:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}
