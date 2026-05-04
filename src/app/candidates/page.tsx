'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Briefcase, UserCircle2 } from 'lucide-react';
import { Candidate } from '@/components/PipelineBoard';
import AddCandidateModal from '@/components/AddCandidateModal';

function CandidatesTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setStageFilter(searchParams.get('stage') ?? '');
  }, [searchParams]);

  useEffect(() => {
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

  const displayedCandidates = stageFilter
    ? candidates.filter((candidate) => candidate.stage === stageFilter)
    : candidates;

  return (
    <div className="p-4 md:p-8 min-h-screen flex flex-col">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">All Candidates</h2>
          <p className="text-sm text-gray-500 mt-1">
            {stageFilter ? `Showing candidates in ${stageFilter}` : 'Directory of everyone in the system'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {stageFilter && (
            <button
              onClick={() => setStageFilter('')}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Clear stage filter
            </button>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            Add Candidate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : displayedCandidates.length === 0 ? (
        <div className="flex justify-center items-center flex-1">
          <p className="text-gray-500">No candidates found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 flex-1">
            {displayedCandidates.map((candidate) => (
              <button
                key={candidate._id}
                onClick={() => router.push(`/candidate/${candidate._id}`)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{candidate.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{candidate.tags.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-100 whitespace-nowrap">
                    {candidate.stage}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{candidate.country}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{candidate.experience || 0}y exp</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Owner: <span className="font-medium text-gray-700">{candidate.assignedRecruiter || 'Unassigned'}</span></span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCandidates.map((candidate) => (
                    <tr key={candidate._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/candidate/${candidate._id}`)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                            {candidate.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-0.5">
                              {candidate.tags.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                          {candidate.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {candidate.country}
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                        {candidate.experience ? `${candidate.experience} Years` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserCircle2 className="w-4 h-4 mr-1 text-gray-400" />
                        {candidate.assignedRecruiter || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/candidate/${candidate._id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <AddCandidateModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => fetchCandidates(searchQuery)} 
      />
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={(
        <div className="p-8 max-w-6xl mx-auto h-screen flex items-center justify-center text-sm text-gray-500">
          Loading candidates...
        </div>
      )}
    >
      <CandidatesTable />
    </Suspense>
  );
}
