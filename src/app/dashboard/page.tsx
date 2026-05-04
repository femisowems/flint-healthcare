'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, Clock, AlertCircle, ArrowRight, FileText, CalendarClock, Bell } from 'lucide-react';
import { Candidate } from '@/components/PipelineBoard';
import { formatDistanceToNow } from 'date-fns';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Visa Processing', 'Placed'] as const;
const STAGE_SLA_DAYS: Record<(typeof STAGES)[number], number> = {
  Applied: 3,
  Screening: 5,
  Interview: 7,
  Offer: 4,
  'Visa Processing': 14,
  Placed: Number.POSITIVE_INFINITY,
};
const TIME_RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

type RecentActivity = {
  _id: string;
  type: string;
  payload?: {
    from?: string | null;
    to?: string;
    text?: string;
  };
  timestamp: string;
  userId: string;
  candidateId: {
    _id: string;
    name: string;
    stage: string;
    updatedAt: string;
  };
};

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(30);
  const router = useRouter();

  useEffect(() => {
    fetchCandidates();
    fetchActivities();
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

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities?limit=6');
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    }
  };

  const rangeStart = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - rangeDays);
    return date;
  }, [rangeDays]);

  const rangeCandidates = useMemo(() => {
    return candidates.filter((candidate) => new Date(candidate.createdAt) >= rangeStart);
  }, [candidates, rangeStart]);

  const totalCandidates = rangeCandidates.length;
  const placedCandidates = rangeCandidates.filter((candidate) => candidate.stage === 'Placed');
  const placementRate = totalCandidates > 0 ? Math.round((placedCandidates.length / totalCandidates) * 100) : 0;

  const averageDaysToPlacement = placedCandidates.length
    ? Math.round(
        placedCandidates.reduce((total, candidate) => {
          const createdAt = new Date(candidate.createdAt).getTime();
          const updatedAt = new Date(candidate.updatedAt).getTime();
          return total + Math.max(updatedAt - createdAt, 0);
        }, 0) / placedCandidates.length / (1000 * 60 * 60 * 24)
      )
    : 0;

  const candidatesByStage = STAGES.map((stage) => ({
    stage,
    count: rangeCandidates.filter((candidate) => candidate.stage === stage).length,
  }));

  const bottleneckStage = candidatesByStage.reduce((current, next) => (next.count > current.count ? next : current), candidatesByStage[0]);
  const overdueVisaCandidate = useMemo(() => {
    const now = Date.now();
    return rangeCandidates
      .filter((candidate) => candidate.stage === 'Visa Processing')
      .map((candidate) => ({
        candidate,
        daysInStage: Math.floor((now - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => b.daysInStage - a.daysInStage)[0];
  }, [rangeCandidates]);

  const staleApplicationCount = useMemo(() => {
    const now = Date.now();
    return rangeCandidates.filter((candidate) => {
      if (candidate.stage === 'Placed') return false;
      const daysSinceUpdate = Math.floor((now - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceUpdate >= 14;
    }).length;
  }, [rangeCandidates]);

  const upcomingInterviews = useMemo(() => {
    return rangeCandidates
      .filter((candidate) => candidate.stage === 'Interview' || candidate.interviewDate)
      .sort((a, b) => new Date(a.interviewDate || a.updatedAt).getTime() - new Date(b.interviewDate || b.updatedAt).getTime())
      .slice(0, 4);
  }, [rangeCandidates]);

  const slaBreaches = useMemo(() => {
    const now = Date.now();
    return rangeCandidates
      .filter((candidate) => candidate.stage !== 'Placed')
      .map((candidate) => {
        const daysInStage = Math.floor((now - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
        const threshold = STAGE_SLA_DAYS[candidate.stage as (typeof STAGES)[number]] ?? 7;
        return {
          candidate,
          daysInStage,
          threshold,
        };
      })
      .filter((item) => item.daysInStage > item.threshold)
      .sort((a, b) => b.daysInStage - a.daysInStage)
      .slice(0, 4);
  }, [rangeCandidates]);

  const documentGaps = useMemo(() => {
    return rangeCandidates
      .map((candidate) => {
        const missingDocuments = [
          !candidate.documents?.resume?.received ? 'Resume' : null,
          !candidate.documents?.nursingLicense?.received ? 'Nursing License' : null,
          !candidate.documents?.passport?.received ? 'Passport' : null,
          !candidate.documents?.visaPacket?.received ? 'Visa Packet' : null,
        ].filter(Boolean) as string[];

        return { candidate, missingDocuments };
      })
      .filter((item) => item.missingDocuments.length > 0)
      .sort((a, b) => b.missingDocuments.length - a.missingDocuments.length)
      .slice(0, 4);
  }, [rangeCandidates]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const maxCount = Math.max(...candidatesByStage.map(s => s.count));

  const openCandidates = (stage?: string) => {
    if (stage) {
      router.push(`/candidates?stage=${encodeURIComponent(stage)}`);
      return;
    }
    router.push('/candidates');
  };

  const openCandidate = (candidateId: string) => {
    router.push(`/candidate/${candidateId}`);
  };

  const getActivityLabel = (activity: RecentActivity) => {
    if (activity.type === 'stage_change') return 'Stage changed';
    if (activity.type === 'note') return 'Note added';
    if (activity.type === 'upload') return 'File uploaded';
    if (activity.type === 'email') return 'Email logged';
    return 'Activity logged';
  };

  const getActivityBody = (activity: RecentActivity) => {
    if (activity.type === 'stage_change') {
      return `Moved from ${activity.payload?.from || 'Unknown'} to ${activity.payload?.to || 'Unknown'}`;
    }

    if (activity.type === 'note') {
      return activity.payload?.text || 'A note was added to the candidate timeline.';
    }

    return 'Updated candidate timeline.';
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    accentClass,
    onClick,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    accentClass: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg ${accentClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
        {subtitle}
        <ArrowRight className="w-3 h-3" />
      </p>
    </button>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Ops Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">High-level metrics and pipeline health</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setRangeDays(range.value)}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                rangeDays === range.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-gray-500">
          Showing candidates created in the last {rangeDays} days.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <MetricCard
          title="Total Candidates"
          value={String(totalCandidates)}
          subtitle="Open the full candidate list"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          accentClass="bg-indigo-50"
          onClick={() => openCandidates()}
        />

        <MetricCard
          title="Placement Rate"
          value={`${placementRate}%`}
          subtitle="View placed candidates"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          accentClass="bg-emerald-50"
          onClick={() => openCandidates('Placed')}
        />

        <MetricCard
          title="Avg. Time to Placement"
          value={placedCandidates.length ? `${averageDaysToPlacement}d` : 'N/A'}
          subtitle="Inspect placed candidates"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          accentClass="bg-blue-50"
          onClick={() => openCandidates('Placed')}
        />

        <MetricCard
          title="Bottlenecks"
          value={bottleneckStage?.stage ?? 'None'}
          subtitle={`Click to review ${bottleneckStage?.stage ?? 'pipeline'}`}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          accentClass="bg-amber-50"
          onClick={() => openCandidates(bottleneckStage?.stage)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Pipeline Funnel */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Pipeline Distribution</h3>
          <div className="space-y-4">
            {candidatesByStage.map((item) => (
              <button
                key={item.stage}
                onClick={() => openCandidates(item.stage)}
                className="w-full flex items-center text-left rounded-lg px-2 py-1 transition-colors hover:bg-gray-50"
              >
                <div className="w-24 sm:w-32 text-sm text-gray-600 font-medium truncate">{item.stage}</div>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className="h-4 bg-indigo-100 rounded-full flex-1 overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 sm:w-8 text-right text-sm font-semibold text-gray-900 shrink-0">{item.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
            <FileText className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity yet.</p>
            ) : (
              activities.map((activity) => (
                <button
                  key={activity._id}
                  onClick={() => openCandidate(activity.candidateId._id)}
                  className="w-full text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getActivityLabel(activity)}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{activity.candidateId.name}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 max-h-10 overflow-hidden line-clamp-2">{getActivityBody(activity)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900 truncate">Interview Queue & SLA Breaches</h3>
            <CalendarClock className="w-5 h-5 text-gray-400 shrink-0" />
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Interviews</h4>
              <ul className="space-y-3">
                {upcomingInterviews.length === 0 ? (
                  <li className="text-sm text-gray-500">No upcoming interviews scheduled.</li>
                ) : (
                  upcomingInterviews.map((candidate) => (
                    <li key={candidate._id}>
                      <button
                        onClick={() => openCandidate(candidate._id)}
                        className="w-full text-left rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{candidate.name}</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">{candidate.interviewDate ? `Interview on ${new Date(candidate.interviewDate).toLocaleDateString()}` : 'Interview stage'} · {candidate.country}</p>
                          </div>
                          <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">
                            {candidate.assignedRecruiter || 'Unassigned'}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3">SLA Breaches</h4>
              <ul className="space-y-3">
                {slaBreaches.length === 0 ? (
                  <li className="text-sm text-gray-500">No stage SLA breaches detected.</li>
                ) : (
                  slaBreaches.map(({ candidate, daysInStage, threshold }) => (
                    <li key={candidate._id}>
                      <button
                        onClick={() => openCandidate(candidate._id)}
                        className="w-full text-left rounded-lg border border-red-100 bg-red-50/40 px-3 py-2 hover:bg-red-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {candidate.stage} for {daysInStage}d, SLA is {threshold}d
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Document Gaps</h4>
              <ul className="space-y-3">
                {documentGaps.length === 0 ? (
                  <li className="text-sm text-gray-500">All tracked candidates have complete documents.</li>
                ) : (
                  documentGaps.map(({ candidate, missingDocuments }) => (
                    <li key={candidate._id}>
                      <button
                        onClick={() => openCandidate(candidate._id)}
                        className="w-full text-left rounded-lg border border-amber-100 bg-amber-50/40 px-3 py-2 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <Bell className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Missing: {missingDocuments.join(', ')}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                {rangeCandidates.filter((candidate) => candidate.stage === 'Applied').length} candidates still in Applied.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {overdueVisaCandidate ? `${overdueVisaCandidate.candidate.name} has been in Visa Processing for ${overdueVisaCandidate.daysInStage}+ days.` : 'No Visa Processing blockers right now.'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {staleApplicationCount} candidates have not moved in 14+ days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
