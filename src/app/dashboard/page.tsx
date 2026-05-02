'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Candidate } from '@/components/PipelineBoard';

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to fetch candidates', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalCandidates = candidates.length;
  const placedCandidates = candidates.filter(c => c.stage === 'Placed').length;
  const placementRate = totalCandidates > 0 ? Math.round((placedCandidates / totalCandidates) * 100) : 0;

  const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'];
  const candidatesByStage = STAGES.map(stage => ({
    stage,
    count: candidates.filter(c => c.stage === stage).length
  }));

  const maxCount = Math.max(...candidatesByStage.map(s => s.count));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Ops Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">High-level metrics and pipeline health</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCandidates}</p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Placement Rate</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{placementRate}%</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Of total applications</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Avg. Time to Placement</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">45d</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Historical average</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Bottlenecks</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 leading-tight">Visa Processing</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Longest average stay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pipeline Funnel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Pipeline Distribution</h3>
          <div className="space-y-4">
            {candidatesByStage.map((item) => (
              <div key={item.stage} className="flex items-center">
                <div className="w-32 text-sm text-gray-600 font-medium">{item.stage}</div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="h-4 bg-indigo-100 rounded-full flex-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity placeholder (optional, can just be a styled box for now) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Action Items</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Review 3 new applications</p>
                <p className="text-xs text-gray-500 mt-0.5">Applied stage needs attention</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Elena Rostova stuck in Visa Processing</p>
                <p className="text-xs text-gray-500 mt-0.5">Candidate has been in stage for 14+ days</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
