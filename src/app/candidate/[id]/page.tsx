'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Tag, FileText, Send, User, ChevronRight, BadgeCheck, CalendarDays, FolderKanban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const RECRUITER_OPTIONS = [
  { label: 'Admin User', value: 'Admin User', email: 'admin@flint.test' },
  { label: 'Priya Shah', value: 'Priya Shah', email: 'priya@flint.test' },
  { label: 'Daniel Kim', value: 'Daniel Kim', email: 'daniel@flint.test' },
  { label: 'Sofia Alvarez', value: 'Sofia Alvarez', email: 'sofia@flint.test' },
];

const REQUIRED_DOCUMENTS = [
  { key: 'resume', label: 'Resume' },
  { key: 'nursingLicense', label: 'Nursing License' },
  { key: 'passport', label: 'Passport' },
  { key: 'visaPacket', label: 'Visa Packet' },
] as const;

type Activity = {
  _id: string;
  type: string;
  actorName?: string;
  actorEmail?: string;
  field?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: string;
  userId: string;
};

export default function CandidateProfile() {
  const params = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [candidate, setCandidate] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    email: '',
    country: '',
    experience: '',
    specialization: '',
    tags: '',
  });
  const [ownerDraft, setOwnerDraft] = useState({
    assignedRecruiter: '',
    assignedRecruiterEmail: '',
    interviewDate: '',
    documents: {
      resume: false,
      nursingLicense: false,
      passport: false,
      visaPacket: false,
    },
  });

  const draftStorageKey = `flint-candidate-draft-${params.id ?? 'unknown'}`;

  useEffect(() => {
    if (!params.id) return;

    try {
      const raw = window.localStorage.getItem(draftStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        note?: string;
        profileDraft?: typeof profileDraft;
        ownerDraft?: typeof ownerDraft;
      };

      if (typeof parsed.note === 'string') {
        setNote(parsed.note);
      }

      if (parsed.profileDraft) {
        setProfileDraft((prev) => ({ ...prev, ...parsed.profileDraft }));
      }

      if (parsed.ownerDraft) {
        setOwnerDraft((prev) => ({
          ...prev,
          ...parsed.ownerDraft,
          documents: {
            ...prev.documents,
            ...parsed.ownerDraft?.documents,
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to restore candidate draft', error);
    }
  }, [draftStorageKey, params.id]);

  useEffect(() => {
    if (!params.id || loading) return;

    try {
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({ note, profileDraft, ownerDraft }),
      );
    } catch (error) {
      console.warn('Failed to persist candidate draft', error);
    }
  }, [draftStorageKey, loading, note, ownerDraft, params.id, profileDraft]);

  useEffect(() => {
    if (params.id) {
      fetchCandidateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setProfileDraft({
        name: candData.name || '',
        email: candData.email || '',
        country: candData.country || '',
        experience: candData.experience?.toString() || '',
        specialization: candData.specialization || '',
        tags: Array.isArray(candData.tags) ? candData.tags.join(', ') : '',
      });
      setOwnerDraft({
        assignedRecruiter: candData.assignedRecruiter || 'Admin User',
        assignedRecruiterEmail: candData.assignedRecruiterEmail || 'admin@flint.test',
        interviewDate: candData.interviewDate ? candData.interviewDate.slice(0, 10) : '',
        documents: {
          resume: candData.documents?.resume?.received || false,
          nursingLicense: candData.documents?.nursingLicense?.received || false,
          passport: candData.documents?.passport?.received || false,
          visaPacket: candData.documents?.visaPacket?.received || false,
        },
      });
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
          actorName: ownerDraft.assignedRecruiter || 'Admin User',
          actorEmail: ownerDraft.assignedRecruiterEmail || 'admin@flint.test',
        }),
      });
      const newActivity = await res.json();
      setActivities([newActivity, ...activities]);
      setNote('');
      toast.success('Note added');
    } catch (error) {
      console.error('Failed to add note', error);
      toast.error('Failed to add note');
    }
  };

  const handleStageChange = async (newStage: string) => {
    try {
      const res = await fetch(`/api/candidates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          actorName: ownerDraft.assignedRecruiter || 'Admin User',
          actorEmail: ownerDraft.assignedRecruiterEmail || 'admin@flint.test',
        }),
      });
      const updatedCandidate = await res.json();
      setCandidate(updatedCandidate);
      fetchCandidateData(); // Refresh activities to get the stage_change event
      toast.success(`Stage changed to ${newStage}`);
    } catch (error) {
      console.error('Failed to change stage', error);
      toast.error('Failed to update stage');
    }
  };

  const handleProfileSave = async () => {
    try {
      const payload = {
        name: profileDraft.name.trim(),
        email: profileDraft.email.trim(),
        country: profileDraft.country.trim(),
        experience: profileDraft.experience ? Number(profileDraft.experience) : undefined,
        specialization: profileDraft.specialization.trim(),
        tags: profileDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        actorName: ownerDraft.assignedRecruiter || 'Admin User',
        actorEmail: ownerDraft.assignedRecruiterEmail || 'admin@flint.test',
      };

      const res = await fetch(`/api/candidates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update candidate profile');
      }

      const updatedCandidate = await res.json();
      setCandidate(updatedCandidate);
      fetchCandidateData();
      toast.success('Profile details saved');
      window.localStorage.removeItem(draftStorageKey);
    } catch (error) {
      console.error('Failed to save profile details', error);
      toast.error('Failed to save profile details');
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

  const missingDocuments = REQUIRED_DOCUMENTS.filter((document) => !ownerDraft.documents[document.key]);

  const handleOwnershipSave = async () => {
    try {
      const selectedRecruiter = RECRUITER_OPTIONS.find((recruiter) => recruiter.value === ownerDraft.assignedRecruiter);
      const payload = {
        assignedRecruiter: ownerDraft.assignedRecruiter,
        assignedRecruiterEmail: selectedRecruiter?.email || ownerDraft.assignedRecruiterEmail,
        interviewDate: ownerDraft.interviewDate || null,
        documents: {
          resume: { received: ownerDraft.documents.resume },
          nursingLicense: { received: ownerDraft.documents.nursingLicense },
          passport: { received: ownerDraft.documents.passport },
          visaPacket: { received: ownerDraft.documents.visaPacket },
        },
        actorName: ownerDraft.assignedRecruiter || 'Admin User',
        actorEmail: selectedRecruiter?.email || ownerDraft.assignedRecruiterEmail || 'admin@flint.test',
      };

      const res = await fetch(`/api/candidates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update candidate metadata');
      }

      const updatedCandidate = await res.json();
      setCandidate(updatedCandidate);
      fetchCandidateData();
      toast.success('Ownership and documents saved');
      window.localStorage.removeItem(draftStorageKey);
    } catch (error) {
      console.error('Failed to save ownership details', error);
      toast.error('Failed to save ownership details');
    }
  };

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

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileDraft.email}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Country</label>
                  <input
                    type="text"
                    value={profileDraft.country}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={profileDraft.experience}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, experience: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Specialization</label>
                <input
                  type="text"
                  value={profileDraft.specialization}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, specialization: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tags</label>
                <input
                  type="text"
                  value={profileDraft.tags}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ICU, Bilingual, Surgical"
                />
              </div>
              <button
                onClick={handleProfileSave}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <BadgeCheck className="mr-2 h-4 w-4" /> Save Profile Details
              </button>
            </div>
            
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

            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">Ownership & Tracking</h4>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Assigned Recruiter</label>
                <select
                  value={ownerDraft.assignedRecruiter}
                  onChange={(e) => {
                    const selectedRecruiter = RECRUITER_OPTIONS.find((recruiter) => recruiter.value === e.target.value);
                    setOwnerDraft((prev) => ({
                      ...prev,
                      assignedRecruiter: e.target.value,
                      assignedRecruiterEmail: selectedRecruiter?.email || prev.assignedRecruiterEmail,
                    }));
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {RECRUITER_OPTIONS.map((recruiter) => (
                    <option key={recruiter.value} value={recruiter.value}>{recruiter.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={ownerDraft.interviewDate}
                  onChange={(e) => setOwnerDraft((prev) => ({ ...prev, interviewDate: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Documents received</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {REQUIRED_DOCUMENTS.map((document) => (
                    <label key={document.key} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2">
                      <input
                        type="checkbox"
                        checked={ownerDraft.documents[document.key]}
                        onChange={(e) => setOwnerDraft((prev) => ({
                          ...prev,
                          documents: { ...prev.documents, [document.key]: e.target.checked },
                        }))}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span>{document.label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Missing: {missingDocuments.length > 0 ? missingDocuments.map((document) => document.label).join(', ') : 'None'}
                </p>
              </div>
              <button
                onClick={handleOwnershipSave}
                className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <BadgeCheck className="mr-2 h-4 w-4" /> Save Ownership
              </button>
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
          <button 
            onClick={() => toast('More actions coming soon', { icon: '⚙️' })}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
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

            {candidate.stage === 'Interview' && candidate.interviewDate && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm mb-8">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <CalendarDays className="w-4 h-4" /> Interview reminder
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Interview scheduled for {new Date(candidate.interviewDate).toLocaleDateString()}. Keep the candidate warm and confirm documentation before the call.
                </p>
              </div>
            )}

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
                        {activity.type === 'stage_change' ? 'Stage Changed' : activity.type === 'profile_update' ? 'Profile Updated' : activity.type === 'assignment_change' ? 'Ownership Changed' : activity.type === 'document_update' ? 'Documents Updated' : activity.type === 'note' ? 'Note Added' : 'Activity'}
                      </span>
                      <time className="text-xs font-medium text-gray-500">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</time>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.actorName || activity.userId}
                      {activity.actorEmail ? ` · ${activity.actorEmail}` : ''}
                    </p>
                    <div className="text-sm text-gray-600 mt-2">
                      {activity.type === 'stage_change' && (
                        <span>{activity.actorName || activity.userId} moved stage from <strong>{activity.payload?.from || 'Unknown'}</strong> to <strong>{activity.payload?.to}</strong></span>
                      )}
                      {activity.type === 'profile_update' && (
                        <div className="space-y-1">
                          <span>{activity.actorName || activity.userId} updated profile details</span>
                          {Array.isArray(activity.payload?.changes) && (
                            <ul className="mt-2 space-y-1 text-xs text-gray-500">
                              {activity.payload.changes.map((change: { field: string; from: unknown; to: unknown }) => (
                                <li key={change.field}>
                                  {change.field}: <strong>{String(change.from ?? 'Empty')}</strong> → <strong>{String(change.to ?? 'Empty')}</strong>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      {activity.type === 'assignment_change' && (
                        <span>{activity.actorName || activity.userId} reassigned ownership from <strong>{activity.payload?.from || 'Unassigned'}</strong> to <strong>{activity.payload?.to}</strong></span>
                      )}
                      {activity.type === 'document_update' && (
                        <span>{activity.actorName || activity.userId} updated the document checklist</span>
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
