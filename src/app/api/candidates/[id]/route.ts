import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';
import Candidate from '@/models/Candidate';
import Activity from '@/models/Activity';

const DEMO_CANDIDATES: Record<string, unknown> = {
  'demo-1': {
    _id: 'demo-1',
    name: 'Asha Patel',
    email: 'asha@example.com',
    country: 'India',
    stage: 'Applied',
    tags: ['RN', 'ICU'],
    assignedRecruiter: 'Admin User',
    assignedRecruiterEmail: 'admin@flint.test',
    experience: 5,
    specialization: 'Critical Care',
    documents: { resume: { received: true }, nursingLicense: { received: false }, passport: { received: false }, visaPacket: { received: false } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'demo-2': {
    _id: 'demo-2',
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    country: 'Egypt',
    stage: 'Screening',
    tags: ['RN', 'Pediatrics'],
    experience: 3,
    specialization: 'Pediatrics',
    documents: { resume: { received: false }, nursingLicense: { received: false }, passport: { received: false }, visaPacket: { received: false } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'demo-3': {
    _id: 'demo-3',
    name: 'Maria Gonzalez',
    email: 'maria@example.com',
    country: 'Philippines',
    stage: 'Interview',
    tags: ['RN', 'ER'],
    assignedRecruiter: 'Admin User',
    assignedRecruiterEmail: 'admin@flint.test',
    experience: 7,
    specialization: 'Emergency',
    documents: { resume: { received: true }, nursingLicense: { received: false }, passport: { received: true }, visaPacket: { received: false } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'demo-4': {
    _id: 'demo-4',
    name: 'David Osei',
    email: 'david.o@example.com',
    country: 'Ghana',
    stage: 'Offer',
    tags: ['Oncology', 'Travel Nurse'],
    assignedRecruiter: 'Priya Shah',
    assignedRecruiterEmail: 'priya@flint.test',
    experience: 4,
    specialization: 'Oncology',
    documents: { resume: { received: true }, nursingLicense: { received: true }, passport: { received: true }, visaPacket: { received: false } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'demo-5': {
    _id: 'demo-5',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    country: 'Ukraine',
    stage: 'Visa Processing',
    tags: ['Surgical', 'Scrub Nurse'],
    assignedRecruiter: 'Daniel Kim',
    assignedRecruiterEmail: 'daniel@flint.test',
    experience: 8,
    specialization: 'Surgery',
    documents: { resume: { received: true }, nursingLicense: { received: true }, passport: { received: true }, visaPacket: { received: false } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'demo-6': {
    _id: 'demo-6',
    name: 'Liam Chen',
    email: 'liam.c@example.com',
    country: 'Singapore',
    stage: 'Placed',
    tags: ['Cardiology', 'Charge Nurse'],
    assignedRecruiter: 'Admin User',
    assignedRecruiterEmail: 'admin@flint.test',
    experience: 10,
    specialization: 'Cardiology',
    documents: { resume: { received: true }, nursingLicense: { received: true }, passport: { received: true }, visaPacket: { received: true } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function isDemoId(id: string) {
  return id.startsWith('demo-');
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDemoId(params.id) && DEMO_CANDIDATES[params.id]) {
      return NextResponse.json(DEMO_CANDIDATES[params.id]);
    }

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
    if (isDemoId(params.id) && DEMO_CANDIDATES[params.id]) {
      const body = await request.json();
      const current = DEMO_CANDIDATES[params.id] as Record<string, unknown>;
      return NextResponse.json({ ...current, ...body, updatedAt: new Date().toISOString() });
    }

    await connectToDatabase();
    const body = await request.json();
    
    const existingCandidate = await Candidate.findById(params.id);
    const actorName = body.actorName || 'Admin User';
    const actorEmail = body.actorEmail || 'admin@flint.test';

    if (existingCandidate) {
      const profileFields = ['name', 'email', 'country', 'experience', 'specialization', 'tags'] as const;
      const existingProfile = existingCandidate.toObject() as Record<(typeof profileFields)[number], unknown>;
      const changes = profileFields
        .filter((field) => body[field] !== undefined && JSON.stringify(body[field]) !== JSON.stringify(existingProfile[field]))
        .map((field) => ({
          field,
          from: existingProfile[field],
          to: body[field],
        }));

      if (changes.length > 0) {
        await Activity.create({
          candidateId: existingCandidate._id,
          type: 'profile_update',
          actorName,
          actorEmail,
          field: 'profile',
          payload: {
            summary: 'Updated candidate profile details',
            changes,
          },
        });
      }

      if (body.stage && existingCandidate.stage !== body.stage) {
        await Activity.create({
          candidateId: existingCandidate._id,
          type: 'stage_change',
          actorName,
          actorEmail,
          field: 'stage',
          payload: {
            from: existingCandidate.stage,
            to: body.stage,
            summary: `Moved candidate stage from ${existingCandidate.stage} to ${body.stage}`,
          },
        });
      }

      if (
        body.assignedRecruiter &&
        body.assignedRecruiter !== existingCandidate.assignedRecruiter
      ) {
        await Activity.create({
          candidateId: existingCandidate._id,
          type: 'assignment_change',
          actorName,
          actorEmail,
          field: 'assignedRecruiter',
          payload: {
            from: existingCandidate.assignedRecruiter || 'Unassigned',
            to: body.assignedRecruiter,
            summary: `Reassigned candidate from ${existingCandidate.assignedRecruiter || 'Unassigned'} to ${body.assignedRecruiter}`,
          },
        });
      }

      if (body.documents) {
        await Activity.create({
          candidateId: existingCandidate._id,
          type: 'document_update',
          actorName,
          actorEmail,
          field: 'documents',
          payload: {
            summary: 'Updated document checklist',
            documents: body.documents,
          },
        });
      }
    }

    const candidate = await Candidate.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}
