# Global Talent Pipeline CRM (Flint Healthcare)

A specialized internal tool designed to manage international healthcare candidates (e.g., nurses) through a complex recruiting and immigration pipeline. The system is built for speed, data-density, and flexibility, prioritizing non-technical operations teams.

## 🚀 Features

- **Kanban Pipeline Board**: Drag-and-drop candidates across stages (`Applied`, `Screening`, `Interview`, `Offer`, `Visa Processing`, `Placed`).
- **Real-Time Search & Filtering**: Fast candidate lookup with debounced backend queries.
- **Candidate Profile & Smart Timelines**: Detailed profiles with immutable timeline events. Dragging a card automatically logs a timestamped "Stage Change" event.
- **Ops Dashboard**: High-level metrics showing total candidates, placement rates, pipeline bottlenecks, and distribution visualization.
- **Notes System**: Append rich, contextual notes directly to a candidate's timeline.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, `@hello-pangea/dnd`
- **Backend**: Next.js API Routes (RESTful)
- **Database**: MongoDB (Mongoose ODMs)
- **Language**: TypeScript

## 📦 Local Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Configuration**
   By default, the application connects to a local MongoDB instance. If you are using MongoDB Atlas or another URI, create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flint-crm
   ```

3. **Seed the Database**
   To populate the database with mock candidates and timeline activities:
   ```bash
   npm run seed
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

### Candidate Model
- `name`, `email`, `country`
- `stage` (Enum)
- `tags` (Array of Strings)
- `experience`, `specialization`
- `status` (`Active`, `Rejected`, `On Hold`)

### Activity Model
- `candidateId` (Reference to Candidate)
- `type` (`stage_change`, `note`, `upload`)
- `payload` (Flexible JSON containing contextual data like "from" and "to" stages)
- `timestamp`, `userId`

## 🧠 Future Roadmap

- [ ] Connect actual LLM for the mock AI resume parsing endpoint (`/api/ai/parse-resume`).
- [ ] Implement robust Authentication (e.g., Auth.js / NextAuth).
- [ ] Add PDF document upload functionality with AWS S3 / Google Cloud Storage.
- [ ] Implement Websockets / Server-Sent Events for live multi-user updates.
