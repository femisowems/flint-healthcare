import mongoose from 'mongoose';
import Candidate from '../models/Candidate';
import Activity from '../models/Activity';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flint-crm';

const mockCandidates = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    country: 'United Kingdom',
    stage: 'Applied',
    assignedRecruiter: 'Priya Shah',
    assignedRecruiterEmail: 'priya@flint.test',
    tags: ['ICU', 'Registered Nurse'],
    experience: 5,
    specialization: 'Intensive Care',
    documents: {
      resume: { received: true },
      nursingLicense: { received: true },
      passport: { received: true },
      visaPacket: { received: false },
    },
  },
  {
    name: 'Miguel Fernandez',
    email: 'miguel.f@example.com',
    country: 'Philippines',
    stage: 'Screening',
    assignedRecruiter: 'Daniel Kim',
    assignedRecruiterEmail: 'daniel@flint.test',
    tags: ['Pediatric', 'Bilingual'],
    experience: 3,
    specialization: 'Pediatrics',
    documents: {
      resume: { received: true },
      nursingLicense: { received: false },
      passport: { received: true },
      visaPacket: { received: false },
    },
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.p@example.com',
    country: 'India',
    stage: 'Interview',
    assignedRecruiter: 'Sofia Alvarez',
    assignedRecruiterEmail: 'sofia@flint.test',
    interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    tags: ['ER', 'Trauma'],
    experience: 7,
    specialization: 'Emergency Room',
    documents: {
      resume: { received: true },
      nursingLicense: { received: true },
      passport: { received: false },
      visaPacket: { received: false },
    },
  },
  {
    name: 'David Osei',
    email: 'david.o@example.com',
    country: 'Ghana',
    stage: 'Offer',
    assignedRecruiter: 'Priya Shah',
    assignedRecruiterEmail: 'priya@flint.test',
    tags: ['Oncology', 'Travel Nurse'],
    experience: 4,
    specialization: 'Oncology',
    documents: {
      resume: { received: true },
      nursingLicense: { received: true },
      passport: { received: true },
      visaPacket: { received: false },
    },
  },
  {
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    country: 'Ukraine',
    stage: 'Visa Processing',
    assignedRecruiter: 'Daniel Kim',
    assignedRecruiterEmail: 'daniel@flint.test',
    tags: ['Surgical', 'Scrub Nurse'],
    experience: 8,
    specialization: 'Surgery',
    documents: {
      resume: { received: true },
      nursingLicense: { received: true },
      passport: { received: true },
      visaPacket: { received: false },
    },
  },
  {
    name: 'Liam Chen',
    email: 'liam.c@example.com',
    country: 'Singapore',
    stage: 'Placed',
    assignedRecruiter: 'Admin User',
    assignedRecruiterEmail: 'admin@flint.test',
    tags: ['Cardiology', 'Charge Nurse'],
    experience: 10,
    specialization: 'Cardiology',
    documents: {
      resume: { received: true },
      nursingLicense: { received: true },
      passport: { received: true },
      visaPacket: { received: true },
    },
  },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    // We pass the URI directly here to avoid issues if run from ts-node outside Next context
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Candidate.deleteMany({});
    await Activity.deleteMany({});

    console.log('Seeding candidates...');
    for (const candidateData of mockCandidates) {
      const candidate = await Candidate.create(candidateData);
      
      // Create initial activity
      await Activity.create({
        candidateId: candidate._id,
        type: 'stage_change',
        actorName: 'Admin User',
        actorEmail: 'admin@flint.test',
        field: 'stage',
        payload: {
          from: null,
          to: candidate.stage,
          note: 'Initial application received',
        },
        userId: 'system',
      });
      
      // If beyond applied, add some mock history
      if (candidate.stage !== 'Applied') {
        await Activity.create({
          candidateId: candidate._id,
          type: 'note',
          actorName: 'Priya Shah',
          actorEmail: 'priya@flint.test',
          payload: {
            text: 'Candidate seems like a strong fit based on resume.',
          },
          userId: 'recruiter_1',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        });
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
