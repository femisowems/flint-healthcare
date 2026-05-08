# Flint Healthcare CRM

Flint Healthcare CRM is an internal global talent pipeline tool for managing international healthcare candidates through a structured recruiting and placement workflow. It is designed for ops and recruiting teams that need a fast, data-dense interface for tracking applications, updating stages, reviewing candidate histories, and keeping the pipeline moving.

## Overview

The app centers around a Kanban-style pipeline board backed by MongoDB. Recruiters can add candidates, move them through the funnel, search the directory, and inspect candidate details. Every stage change is recorded as an activity so the timeline remains auditable.

The current prototype includes:

- A drag-and-drop pipeline board for stage management.
- A searchable candidates directory with profile drill-downs.
- An ops dashboard with summary metrics and pipeline distribution.
- A candidate profile workspace with draft persistence and audit history.
- A settings area for account, notification, security, and integration controls.
- A mocked resume parsing endpoint for AI-assisted intake experimentation.
- Demo-data fallbacks so the UI remains usable even when the database is unavailable.

## Features

- **Pipeline management**: Drag candidates across `Applied`, `Screening`, `Interview`, `Offer`, `Visa Processing`, and `Placed`.
- **Candidate search**: Debounced search across name, email, and tags.
- **Candidate creation**: Add candidates from the board or directory views.
- **Activity logging**: Stage moves create timeline events automatically.
- **Dashboard metrics**: View total candidates, placement rate, stage distribution, and bottlenecks.
- **Candidate profile editing**: Update profile details, ownership, interview dates, and document status.
- **Draft persistence**: Unsaved profile edits survive refreshes through local storage.
- **Settings UI**: Edit profile preferences, notification toggles, security settings, and integrations.
- **Mock AI parsing**: Simulate extraction of experience, specialization, tags, and suggested stage from resume text.

## Tech Stack

- **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, `@hello-pangea/dnd`
- **Backend**: Next.js route handlers under `src/app/api`
- **Database**: MongoDB with Mongoose
- **Utilities**: `react-hot-toast`, `date-fns`, `clsx`, `tailwind-merge`
- **Language**: TypeScript
- **Deployment**: Vercel

## Requirements

- Node.js 18.18 or newer
- npm 10 or newer
- A MongoDB connection string, either local or Atlas

## Environment Variables

Create a `.env.local` file in the project root with:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flint-crm
SEED_SECRET=<strong-random-secret>
```

- `MONGODB_URI` points the app to MongoDB Atlas or a local MongoDB instance.
- `SEED_SECRET` protects the seed endpoint used for deployment setup.
- If `MONGODB_URI` is omitted, the app falls back to `mongodb://localhost:27017/flint-crm`.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your environment variables to `.env.local`.

3. Seed the database with sample candidates and activities:

   ```bash
   npm run seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` starts the Next.js development server.
- `npm run build` builds the app for production.
- `npm run start` runs the production build.
- `npm run lint` runs the Next.js lint command.
- `npm run typecheck` runs the TypeScript compiler without emitting output.
- `npm run seed` populates MongoDB with mock candidates and history.
- `npm run seed:local` forces the seed script to target local MongoDB.
- `npm run check-db` verifies the active MongoDB connection.

## Application Structure

- `src/app/page.tsx` renders the main pipeline board.
- `src/app/dashboard/page.tsx` shows aggregated ops metrics.
- `src/app/candidates/page.tsx` provides the searchable directory.
- `src/app/candidate/[id]/page.tsx` shows an individual candidate profile.
- `src/app/settings/page.tsx` contains the settings experience.
- `src/components/PipelineBoard.tsx` implements the board and drag-and-drop behavior.
- `src/components/AddCandidateModal.tsx` handles candidate creation.
- `src/components/Sidebar.tsx` renders the primary navigation.
- `src/models/Candidate.ts` and `src/models/Activity.ts` define the MongoDB models.
- `src/utils/db.ts` manages cached MongoDB connections.

## API Routes

- `GET /api/candidates` returns all candidates.
- `GET /api/candidates?search=...` searches candidates by name, email, or tags.
- `POST /api/candidates` creates a new candidate.
- `GET /api/candidates/[id]` fetches a single candidate.
- `PUT /api/candidates/[id]` updates a candidate and logs stage changes as activities.
- `GET /api/candidates/[id]/activities` returns the candidate activity timeline.
- `POST /api/candidates/[id]/activities` creates a manual activity entry.
- `GET /api/activities` returns recent activity across the app.
- `POST /api/ai/parse-resume` accepts resume text and returns mocked structured suggestions.
- `POST /api/seed` seeds the database when the `SEED_SECRET` is provided.

## Data Model

### Candidate

- `name`, `email`, and `country` are required.
- `stage` is one of `Applied`, `Screening`, `Interview`, `Offer`, `Visa Processing`, or `Placed`.
- `tags` stores optional structured labels such as clinical specialties or language skills.
- `experience` and `specialization` capture basic hiring context.
- `status` supports `Active`, `Rejected`, and `On Hold`.
- `resumeText` is available for raw resume content if needed.

### Activity

- `candidateId` links an activity to a candidate.
- `type` supports `stage_change`, `note`, `upload`, `email`, and `status_change`.
- `payload` stores flexible context such as stage transitions or note text.
- `timestamp` records when the activity occurred.
- `userId` defaults to `system` for mock data and automated actions.

## Seeding and Demo Data

The seeding script clears existing candidates and activities, then inserts a small representative dataset with healthcare profiles across the pipeline. It also creates initial timeline entries so the UI shows meaningful history on first load.

If the database is unavailable, the app falls back to demo data so the interface still works. That fallback is intentionally read-only and is meant for previewing the product, not persisting changes.

To seed a deployed environment, call the protected endpoint:

```bash
curl "https://<your-domain>/api/seed?secret=$SEED_SECRET"
```

## Deployment Notes

- Set `MONGODB_URI` and `SEED_SECRET` in Vercel environment variables.
- Seed the production database after deployment so the dashboard and pipeline show real records.
- If the app repeatedly loads demo data, check MongoDB network access, Vercel logs, and Atlas connection settings.

## Roadmap

- [ ] Replace the mocked resume parser with a real LLM-backed extraction service.
- [ ] Add authentication and authorization for team-based access.
- [ ] Support document uploads for CVs, visas, and supporting files.
- [ ] Add live updates for multi-user collaboration.
- [ ] Expand reporting with richer funnel and SLA analytics.

## Notes

- The UI currently uses a single admin-style experience with a persistent sidebar.
- MongoDB connections are cached during development to avoid excessive reconnects during hot reloads.
- The app is responsive across mobile, tablet, and desktop layouts.
