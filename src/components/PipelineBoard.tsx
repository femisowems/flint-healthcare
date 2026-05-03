'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddCandidateModal from './AddCandidateModal';
import toast from 'react-hot-toast';

export type Candidate = {
  _id: string;
  name: string;
  country: string;
  stage: string;
  tags: string[];
  assignedRecruiter?: string;
  assignedRecruiterEmail?: string;
  interviewDate?: string;
  documents?: {
    resume?: { received: boolean; updatedAt?: string };
    nursingLicense?: { received: boolean; updatedAt?: string };
    passport?: { received: boolean; updatedAt?: string };
    visaPacket?: { received: boolean; updatedAt?: string };
  };
  experience?: number;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
};

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'];

export default function PipelineBoard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Add debounce for search
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timer = setTimeout(() => {
      fetchCandidates(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const hasSeenIntro = window.localStorage.getItem('flint-crm-intro-dismissed') === 'true';
    if (!hasSeenIntro) {
      setShowIntroModal(true);
    }
  }, []);

  // On first mount, ensure we have demo data available for client-only demos
  useEffect(() => {
    ensureClientSeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCandidates = async (query = '') => {
    try {
      const url = query ? `/api/candidates?search=${encodeURIComponent(query)}` : '/api/candidates';
      const res = await fetch(url);
      const data = await res.json();

      // If server returned an error payload (object) instead of array, treat as failure
      if (!res.ok || !Array.isArray(data)) {
        console.warn('Server candidates fetch failed or returned unexpected shape, falling back to client demo');
        const local = window.localStorage.getItem('flint_demo_candidates');
        if (local) {
          setCandidates(JSON.parse(local));
        } else {
          const seeded = seedDemoCandidates();
          setCandidates(seeded);
        }
        return;
      }

      setCandidates(data);
    } catch (error) {
      console.error('Failed to fetch candidates', error);
      const local = window.localStorage.getItem('flint_demo_candidates');
      if (local) {
        setCandidates(JSON.parse(local));
      } else {
        const seeded = seedDemoCandidates();
        setCandidates(seeded);
      }
    } finally {
      setLoading(false);
    }
  };

  function seedDemoCandidates() {
    const now = new Date().toISOString();
    const demo = [
      {
        _id: 'demo-1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        country: 'United Kingdom',
        stage: 'Applied',
        tags: ['ICU', 'Registered Nurse'],
        assignedRecruiter: 'Priya Shah',
        assignedRecruiterEmail: 'priya@flint.test',
        experience: 5,
        specialization: 'Intensive Care',
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'demo-2',
        name: 'Miguel Fernandez',
        email: 'miguel.f@example.com',
        country: 'Philippines',
        stage: 'Screening',
        tags: ['Pediatric', 'Bilingual'],
        assignedRecruiter: 'Daniel Kim',
        assignedRecruiterEmail: 'daniel@flint.test',
        experience: 3,
        specialization: 'Pediatrics',
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: false, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'demo-3',
        name: 'Aisha Patel',
        email: 'aisha.p@example.com',
        country: 'India',
        stage: 'Interview',
        tags: ['ER', 'Trauma'],
        assignedRecruiter: 'Sofia Alvarez',
        assignedRecruiterEmail: 'sofia@flint.test',
        experience: 7,
        specialization: 'Emergency Room',
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: false, updatedAt: now }, visaPacket: { received: false, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
      {
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
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
      {
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
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: false, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
      {
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
        documents: { resume: { received: true, updatedAt: now }, nursingLicense: { received: true, updatedAt: now }, passport: { received: true, updatedAt: now }, visaPacket: { received: true, updatedAt: now } },
        createdAt: now,
        updatedAt: now,
      },
    ];

    try {
      window.localStorage.setItem('flint_demo_candidates', JSON.stringify(demo));
    } catch (e) {
      console.warn('Could not persist demo candidates to localStorage', e);
    }

    return demo;
  }

  async function ensureClientSeeded() {
    // Try to fetch server candidates once; fetchCandidates will handle fallback.
    await fetchCandidates('');
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;
    
    // Optimistic UI update
    setCandidates((prev) => 
      prev.map((c) => c._id === draggableId ? { ...c, stage: newStage } : c)
    );

    try {
      const res = await fetch(`/api/candidates/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) {
        throw new Error('Failed to update stage');
      }
      
      const movedCandidate = candidates.find(c => c._id === draggableId);
      if (movedCandidate) {
        toast.success(`Moved ${movedCandidate.name} to ${newStage}`);
      }
    } catch (error) {
      console.error('Failed to update candidate stage', error);
      toast.error('Failed to move candidate');
      // Revert optimistic update
      fetchCandidates(searchQuery);
    }
  };

  const closeIntroModal = () => {
    if (dontShowAgain) {
      window.localStorage.setItem('flint-crm-intro-dismissed', 'true');
    }
    setShowIntroModal(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<string, Candidate[]>);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] overflow-hidden">
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl shadow-slate-950/20 border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Interview Demo</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">Flint CRM is a working demo</h3>
              <p className="mt-2 text-sm text-white/90">
                This build was created to walk through the product during an interview. It shows the intended workflow, sample data, and prototype interactions.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600 leading-6">
                You can explore the pipeline, candidate profiles, reminders, and audit timeline. Some actions are fully wired to the database, while others are intentionally scoped as prototype UX for discussion.
              </p>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Don&apos;t show this again on this browser
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeIntroModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Continue to app
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Manage candidate flow and statuses</p>
        </div>
        <div className="flex gap-2">
          {/* Controls like filters, search */}
          <input 
            type="text" 
            placeholder="Search candidates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Add Candidate
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-8 items-start">
          {STAGES.map((stage) => (
            <div key={stage} className="flex-shrink-0 w-80 bg-gray-100/50 rounded-lg flex flex-col max-h-full border border-gray-200">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/80 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-700 text-sm">{stage}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">
                    {candidatesByStage[stage]?.length || 0}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                  >
                    {candidatesByStage[stage]?.map((candidate, index) => (
                      <Draggable key={candidate._id} draggableId={candidate._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => router.push(`/candidate/${candidate._id}`)}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/20 scale-[1.02]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900 leading-tight">{candidate.name}</h4>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500 mb-3 gap-1">
                              <MapPin className="w-3 h-3" />
                              {candidate.country}
                            </div>

                            <div className="text-[11px] text-gray-500 mb-2">
                              Owner: <span className="font-medium text-gray-700">{candidate.assignedRecruiter || 'Unassigned'}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {candidate.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  {tag}
                                </span>
                              ))}
                              {candidate.tags.length > 3 && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  +{candidate.tags.length - 3}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(candidate.updatedAt).toLocaleDateString()}
                              </div>
                              {candidate.experience ? <span>{candidate.experience}y exp</span> : null}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddCandidateModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => fetchCandidates(searchQuery)} 
      />
    </div>
  );
}
