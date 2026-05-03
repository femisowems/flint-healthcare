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
