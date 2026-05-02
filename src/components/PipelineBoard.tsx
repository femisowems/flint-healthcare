'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type Candidate = {
  _id: string;
  name: string;
  country: string;
  stage: string;
  tags: string[];
  experience?: number;
  specialization?: string;
  updatedAt: string;
};

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'];

export default function PipelineBoard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Add debounce for search
    const timer = setTimeout(() => {
      fetchCandidates(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCandidates = async (query = '') => {
    try {
      const url = query ? `/api/candidates?search=${encodeURIComponent(query)}` : '/api/candidates';
      const res = await fetch(url);
      const data = await res.json();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to fetch candidates', error);
    } finally {
      setLoading(false);
    }
  };

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
      await fetch(`/api/candidates/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      // Optionally refresh to get accurate timestamps etc
      // fetchCandidates();
    } catch (error) {
      console.error('Failed to update candidate stage', error);
      // Revert optimism if needed (not implementing complex rollback for prototype)
    }
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
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
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
    </div>
  );
}
