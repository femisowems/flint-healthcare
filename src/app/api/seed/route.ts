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
      { name: 'Sarah Jenkins', email: 'sarah.j@example.com', country: 'United Kingdom', stage: 'Applied', tags: ['ICU', 'Registered Nurse'], assignedRecruiter: 'Priya Shah', assignedRecruiterEmail: 'priya@flint.test', experience: 5, specialization: 'Intensive Care', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
      { name: 'Miguel Fernandez', email: 'miguel.f@example.com', country: 'Philippines', stage: 'Screening', tags: ['Pediatric', 'Bilingual'], assignedRecruiter: 'Daniel Kim', assignedRecruiterEmail: 'daniel@flint.test', experience: 3, specialization: 'Pediatrics', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: false, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
      { name: 'Aisha Patel', email: 'aisha.p@example.com', country: 'India', stage: 'Interview', tags: ['ER', 'Trauma'], assignedRecruiter: 'Sofia Alvarez', assignedRecruiterEmail: 'sofia@flint.test', experience: 7, specialization: 'Emergency Room', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: false, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
      { name: 'David Osei', email: 'david.o@example.com', country: 'Ghana', stage: 'Offer', tags: ['Oncology', 'Travel Nurse'], assignedRecruiter: 'Priya Shah', assignedRecruiterEmail: 'priya@flint.test', experience: 4, specialization: 'Oncology', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
      { name: 'Elena Rostova', email: 'elena.r@example.com', country: 'Ukraine', stage: 'Visa Processing', tags: ['Surgical', 'Scrub Nurse'], assignedRecruiter: 'Daniel Kim', assignedRecruiterEmail: 'daniel@flint.test', experience: 8, specialization: 'Surgery', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
      { name: 'Liam Chen', email: 'liam.c@example.com', country: 'Singapore', stage: 'Placed', tags: ['Cardiology', 'Charge Nurse'], assignedRecruiter: 'Admin User', assignedRecruiterEmail: 'admin@flint.test', experience: 10, specialization: 'Cardiology', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: true, updatedAt: now } }, createdAt: now, updatedAt: now },
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
