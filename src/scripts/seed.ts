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
    tags: ['ICU', 'Registered Nurse'],
    experience: 5,
    specialization: 'Intensive Care',
  },
  {
    name: 'Miguel Fernandez',
    email: 'miguel.f@example.com',
    country: 'Philippines',
    stage: 'Screening',
    tags: ['Pediatric', 'Bilingual'],
    experience: 3,
    specialization: 'Pediatrics',
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.p@example.com',
    country: 'India',
    stage: 'Interview',
    tags: ['ER', 'Trauma'],
    experience: 7,
    specialization: 'Emergency Room',
  },
  {
    name: 'David Osei',
    email: 'david.o@example.com',
    country: 'Ghana',
    stage: 'Offer',
    tags: ['Oncology', 'Travel Nurse'],
    experience: 4,
    specialization: 'Oncology',
  },
  {
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    country: 'Ukraine',
    stage: 'Visa Processing',
    tags: ['Surgical', 'Scrub Nurse'],
    experience: 8,
    specialization: 'Surgery',
  },
  {
    name: 'Liam Chen',
    email: 'liam.c@example.com',
    country: 'Singapore',
    stage: 'Placed',
    tags: ['Cardiology', 'Charge Nurse'],
    experience: 10,
    specialization: 'Cardiology',
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
