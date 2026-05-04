import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Candidate from '@/models/Candidate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function demoCandidates() {
  const now = new Date().toISOString();
  return [
    { _id: 'demo-1', name: 'Sarah Jenkins', email: 'sarah.j@example.com', country: 'United Kingdom', stage: 'Applied', tags: ['ICU', 'Registered Nurse'], assignedRecruiter: 'Priya Shah', assignedRecruiterEmail: 'priya@flint.test', experience: 5, specialization: 'Intensive Care', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
    { _id: 'demo-2', name: 'Miguel Fernandez', email: 'miguel.f@example.com', country: 'Philippines', stage: 'Screening', tags: ['Pediatric', 'Bilingual'], assignedRecruiter: 'Daniel Kim', assignedRecruiterEmail: 'daniel@flint.test', experience: 3, specialization: 'Pediatrics', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: false, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
    { _id: 'demo-3', name: 'Aisha Patel', email: 'aisha.p@example.com', country: 'India', stage: 'Interview', tags: ['ER', 'Trauma'], assignedRecruiter: 'Sofia Alvarez', assignedRecruiterEmail: 'sofia@flint.test', experience: 7, specialization: 'Emergency Room', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: false, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
    { _id: 'demo-4', name: 'David Osei', email: 'david.o@example.com', country: 'Ghana', stage: 'Offer', tags: ['Oncology', 'Travel Nurse'], assignedRecruiter: 'Priya Shah', assignedRecruiterEmail: 'priya@flint.test', experience: 4, specialization: 'Oncology', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
    { _id: 'demo-5', name: 'Elena Rostova', email: 'elena.r@example.com', country: 'Ukraine', stage: 'Visa Processing', tags: ['Surgical', 'Scrub Nurse'], assignedRecruiter: 'Daniel Kim', assignedRecruiterEmail: 'daniel@flint.test', experience: 8, specialization: 'Surgery', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } }, createdAt: now, updatedAt: now },
    { _id: 'demo-6', name: 'Liam Chen', email: 'liam.c@example.com', country: 'Singapore', stage: 'Placed', tags: ['Cardiology', 'Charge Nurse'], assignedRecruiter: 'Admin User', assignedRecruiterEmail: 'admin@flint.test', experience: 10, specialization: 'Cardiology', documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: true, updatedAt: now } }, createdAt: now, updatedAt: now },
  ];
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      };
    }
    
    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    if (!search && candidates.length === 0) {
      console.warn('No candidates found in database, returning demo data');
      return NextResponse.json(demoCandidates());
    }
    return NextResponse.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error instanceof Error ? error.message : error);
    return NextResponse.json(demoCandidates());
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const candidate = await Candidate.create(body);
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    // Fallback: if DB is unavailable, echo back a demo candidate (not persisted)
    try {
      const body = await request.json();
      const now = new Date().toISOString();
      const demoCandidate = {
        _id: `demo-${Date.now()}`,
        ...body,
        createdAt: now,
        updatedAt: now,
      };
      return NextResponse.json(demoCandidate, { status: 201 });
    } catch (e) {
      console.error('Error creating demo fallback candidate:', e);
      return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }
  }
}
