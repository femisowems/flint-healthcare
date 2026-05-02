'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Briefcase, Tag, FileText, Send, User, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Activity = {
  _id: string;
  type: string;
  payload: any;
  timestamp: string;
  userId: string;
};

export default function CandidateProfile() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCandidateData();
    }
  }, [params.id]);

  const fetchCandidateData = async () => {
    try {
      const [candRes, actRes] = await Promise.all([
        fetch(`/api/candidates/${params.id}`),
        fetch(`/api/candidates/${params.id}/activities`)
      ]);
      const candData = await candRes.json();
      const actData = await actRes.json();
      setCandidate(candData);
      setActivities(actData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    try {
      const res = await fetch(`/api/candidates/${params.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note',
          payload: { text: note },
        }),
      });
      const newActivity = await res.json();
      setActivities([newActivity, ...activities]);
      setNote('');
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const handleStageChange = async (newStage: string) => {
    try {
      const res = await fetch(`/api/candidates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      const updatedCandidate = await res.json();
      setCandidate(updatedCandidate);
      fetchCandidateData(); // Refresh activities to get the stage_change event
    } catch (error) {
      console.error('Failed to change stage', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return <div className="p-8">Candidate not found.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-0rem)] overflow-hidden">
      {/* Left Column: Profile Details */}
      <div className="w-[400px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-6">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pipeline
          </button>
          
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold mb-4">
              {candidate.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{candidate.name}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Mail className="w-4 h-4 mr-2" /> {candidate.email}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <MapPin className="w-4 h-4 mr-2" /> {candidate.country}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Candidate Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Experience</span>
                <span className="text-sm font-medium text-gray-900">{candidate.experience ? `${candidate.experience} Years` : 'Unknown'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Specialization</span>
                <span className="text-sm font-medium text-gray-900">{candidate.specialization || 'General'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 block mb-2">Tags</span>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag: string) => (
                  <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-6"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Documents</h3>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Resume.pdf</p>
                  <p className="text-xs text-gray-500">Uploaded {new Date(candidate.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Activity & Notes */}
      <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar for Stage Control */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500 font-medium">Current Stage:</span>
            <select 
              value={candidate.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="bg-indigo-50 border-none text-indigo-700 font-semibold rounded-md py-1 pl-3 pr-8 focus:ring-0 cursor-pointer"
            >
              {['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Actions
          </button>
        </div>

        {/* Timeline & Notes Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            
            {/* Note Input */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Leave a note..."
                className="w-full border-none focus:ring-0 resize-none text-sm text-gray-900 placeholder-gray-400 p-0"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400 flex items-center">
                  <User className="w-4 h-4 mr-1" /> admin@flint.test
                </div>
                <button 
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" /> Post
                </button>
              </div>
            </div>

            {/* Timeline */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Activity History</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {activities.map((activity) => (
                <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {activity.type === 'stage_change' ? (
                      <ChevronRight className="w-5 h-5 text-indigo-500" />
                    ) : activity.type === 'note' ? (
                      <FileText className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {activity.type === 'stage_change' ? 'Stage Changed' : activity.type === 'note' ? 'Note Added' : 'Activity'}
                      </span>
                      <time className="text-xs font-medium text-gray-500">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</time>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {activity.type === 'stage_change' && (
                        <span>Moved from <strong>{activity.payload?.from || 'Unknown'}</strong> to <strong>{activity.payload?.to}</strong></span>
                      )}
                      {activity.type === 'note' && (
                        <p className="whitespace-pre-wrap">{activity.payload?.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
