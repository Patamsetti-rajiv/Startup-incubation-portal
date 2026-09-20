import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus } from '@/types/application';
import {
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Inbox,
  Search,
  Building2,
  Calendar,
  Mail,
  TrendingUp,
  Clock,
  Rocket,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';

interface AdminPortalProps {
  refreshKey: number;
  onDecision: () => void;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  'Under Review': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Approved & Deployed': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Needs Revision': 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const STATUS_DOT: Record<ApplicationStatus, string> = {
  'Under Review': 'bg-amber-500',
  'Approved & Deployed': 'bg-emerald-500',
  'Needs Revision': 'bg-rose-500',
};

export default function AdminPortal({ refreshKey, onDecision }: AdminPortalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [actingId, setActingId] = useState<string | null>(null);
  const [recentDecision, setRecentDecision] = useState<{ id: string; status: ApplicationStatus } | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Failed to load applications. Please try again.');
    } else {
      setApplications((data as Application[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, refreshKey]);

  const handleDecision = async (id: string, isApproved: boolean) => {
    setActingId(id);
    const newStatus: ApplicationStatus = isApproved ? 'Approved & Deployed' : 'Needs Revision';

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (updateError) {
      setError('Failed to update application status.');
      setActingId(null);
      return;
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    setActingId(null);
    setRecentDecision({ id, status: newStatus });
    setTimeout(() => setRecentDecision(null), 2000);
    onDecision();
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.startup_name.toLowerCase().includes(search.toLowerCase()) ||
      app.founder_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    review: applications.filter((a) => a.status === 'Under Review').length,
    approved: applications.filter((a) => a.status === 'Approved & Deployed').length,
    revision: applications.filter((a) => a.status === 'Needs Revision').length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: FileText, color: 'text-slate-700', iconBg: 'bg-slate-100 text-slate-600', ring: 'ring-slate-200/60' },
    { label: 'Under Review', value: stats.review, icon: Clock, color: 'text-amber-700', iconBg: 'bg-amber-100 text-amber-600', ring: 'ring-amber-200/60' },
    { label: 'Approved', value: stats.approved, icon: Rocket, color: 'text-emerald-700', iconBg: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200/60' },
    { label: 'Needs Revision', value: stats.revision, icon: AlertTriangle, color: 'text-rose-700', iconBg: 'bg-rose-100 text-rose-600', ring: 'ring-rose-200/60' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
            <Sparkles className="h-3 w-3" />
            Admin Dashboard
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Review &amp; Evaluation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review and evaluate startup applications for incubation.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ${stat.ring} transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/40 animate-fade-in-up animation-fill-back`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by startup, founder, or email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['All', 'Under Review', 'Approved & Deployed', 'Needs Revision'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                }`}
              >
                {status === 'All' ? 'All' : status}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200 animate-fade-in">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5">
              <div className="shimmer-bg h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="shimmer-bg h-4 w-1/4 rounded" />
                <div className="shimmer-bg h-3 w-1/3 rounded" />
              </div>
              <div className="shimmer-bg h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Inbox className="h-8 w-8 text-slate-300" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">
            {applications.length === 0
              ? 'No applications yet.'
              : 'No applications match your filters.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/30 lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Startup</th>
                  <th className="px-5 py-4">Founder</th>
                  <th className="px-5 py-4">Requirements</th>
                  <th className="px-5 py-4">Pitch Deck</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`group transition-all duration-200 hover:bg-teal-50/30 ${
                      recentDecision?.id === app.id ? 'animate-scale-in bg-teal-50/40' : ''
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 ring-1 ring-teal-100 transition-transform duration-300 group-hover:scale-105">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{app.startup_name}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">{app.founder_name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail className="h-3 w-3" />
                        {app.email}
                      </p>
                    </td>
                    <td className="max-w-[220px] px-5 py-4">
                      <p className="truncate text-sm text-slate-600" title={app.requirements}>
                        {app.requirements}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={app.pitch_deck_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-teal-700 ring-1 ring-slate-200 transition-all duration-200 hover:bg-teal-50 hover:ring-teal-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/link:rotate-12" />
                        View PDF
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[app.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[app.status]} ${app.status === 'Under Review' ? 'animate-pulse' : ''}`} />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecision(app.id, true)}
                          disabled={actingId === app.id || app.status === 'Approved & Deployed'}
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" />
                          )}
                          Approve &amp; Deploy
                        </button>
                        <button
                          onClick={() => handleDecision(app.id, false)}
                          disabled={actingId === app.id || app.status === 'Needs Revision'}
                          className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition-all duration-200 hover:bg-rose-50 hover:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <RotateCcw className="h-3.5 w-3.5 transition-transform group-hover/btn:-rotate-45" />
                          Needs Revision
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 lg:hidden">
            {filtered.map((app, i) => (
              <div
                key={app.id}
                className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up animation-fill-back ${
                  recentDecision?.id === app.id ? 'ring-2 ring-teal-300' : ''
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 ring-1 ring-teal-100">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{app.startup_name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[app.status]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[app.status]} ${app.status === 'Under Review' ? 'animate-pulse' : ''}`} />
                    {app.status}
                  </span>
                </div>

                <div className="mb-3 space-y-1.5 rounded-xl bg-slate-50/60 p-3 text-sm">
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-700">Founder:</span>{' '}
                    {app.founder_name}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-700">Email:</span> {app.email}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium text-slate-700">Requirements:</span>{' '}
                    {app.requirements}
                  </p>
                </div>

                <a
                  href={app.pitch_deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-teal-700 ring-1 ring-slate-200 transition hover:bg-teal-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Pitch Deck
                </a>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(app.id, true)}
                    disabled={actingId === app.id || app.status === 'Approved & Deployed'}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
                  >
                    {actingId === app.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(app.id, false)}
                    disabled={actingId === app.id || app.status === 'Needs Revision'}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
