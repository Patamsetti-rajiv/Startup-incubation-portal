import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus } from '@/types/application';
import {
  Search,
  Loader2,
  AlertCircle,
  Mail,
  Building2,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  ArrowRight,
  SearchX,
} from 'lucide-react';

interface TrackApplicationProps {
  onSubmitted: () => void;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { icon: typeof CheckCircle2; color: string; bg: string; ring: string; dot: string; step: number }
> = {
  'Under Review': {
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    dot: 'bg-amber-500',
    step: 1,
  },
  'Approved & Deployed': {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    dot: 'bg-emerald-500',
    step: 3,
  },
  'Needs Revision': {
    icon: RotateCcw,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    ring: 'ring-rose-200',
    dot: 'bg-rose-500',
    step: 2,
  },
};

const TIMELINE_STEPS = [
  { label: 'Submitted', icon: FileText },
  { label: 'Under Review', icon: Clock },
  { label: 'Decision', icon: CheckCircle2 },
];

export default function TrackApplication({ onSubmitted: _onSubmitted }: TrackApplicationProps) {
  const [email, setEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Application[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setSearched(false);

    const { data, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });

    setLoading(false);

    if (fetchError) {
      setError('Failed to search applications. Please try again.');
      return;
    }

    setResults((data as Application[]) ?? []);
    setSearched(true);
  };

  const handleReset = () => {
    setEmail('');
    setResults([]);
    setSearched(false);
    setError('');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
          <Search className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Track Your Application
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter the email you used to apply and we'll show you the current status of your application(s).
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/40 sm:flex-row sm:items-center sm:p-5"
      >
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="founder@startup.com"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Track Status
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="shimmer-bg h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer-bg h-4 w-1/3 rounded" />
                  <div className="shimmer-bg h-3 w-1/4 rounded" />
                </div>
                <div className="shimmer-bg h-7 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-16 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <SearchX className="h-8 w-8 text-slate-300" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">No applications found</p>
          <p className="mt-1 text-sm text-slate-400">
            We couldn't find any applications for <span className="font-medium text-slate-600">{email}</span>.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Double-check the email address and try again.
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length > 0 && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {results.length} application{results.length > 1 ? 's' : ''} found
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              <Search className="h-3.5 w-3.5" />
              Search again
            </button>
          </div>

          {results.map((app, i) => (
            <ApplicationStatusCard key={app.id} app={app} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationStatusCard({ app, index }: { app: Application; index: number }) {
  const config = STATUS_CONFIG[app.status];
  const StatusIcon = config.icon;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/30 animate-fade-in-up animation-fill-back"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between border-b border-slate-50 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600 ring-1 ring-teal-100">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{app.startup_name}</h3>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              Submitted {new Date(app.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full ${config.bg} px-3 py-1.5 text-xs font-semibold ${config.color} ring-1 ${config.ring}`}
        >
          <span className={`h-2 w-2 rounded-full ${config.dot} ${app.status === 'Under Review' ? 'animate-pulse' : ''}`} />
          {app.status}
        </span>
      </div>

      {/* Timeline */}
      <div className="px-5 py-6 sm:px-6">
        <div className="relative flex items-center justify-between">
          {/* Timeline line */}
          <div className="absolute left-5 right-5 top-5 h-0.5 bg-slate-100" />
          <div
            className="absolute left-5 top-5 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
            style={{
              width: `calc((100% - 2.5rem) * ${config.step / 3})`,
            }}
          />

          {TIMELINE_STEPS.map((step, i) => {
            const isComplete = i < config.step;
            const isCurrent = i === config.step - 1 || (i === 0 && config.step >= 1);
            const StepIcon = step.icon;
            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                    isComplete
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/30'
                      : isCurrent
                        ? `bg-white ring-2 ${config.ring} ${config.color}`
                        : 'bg-white text-slate-300 ring-1 ring-slate-200'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isComplete || isCurrent ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision banner */}
      {app.status === 'Approved & Deployed' && (
        <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200 sm:mx-6 sm:mb-6 animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Congratulations! Your startup has been approved and deployed.</p>
            <p className="text-xs text-emerald-600">Our team will reach out to you shortly with next steps and onboarding details.</p>
          </div>
        </div>
      )}

      {app.status === 'Needs Revision' && (
        <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200 sm:mx-6 sm:mb-6 animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100">
            <RotateCcw className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-800">Your application needs revision.</p>
            <p className="text-xs text-rose-600">Please review your pitch deck and requirements, then resubmit with updates.</p>
          </div>
        </div>
      )}

      {app.status === 'Under Review' && (
        <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:mx-6 sm:mb-6 animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Your application is under review.</p>
            <p className="text-xs text-amber-600">Our team is evaluating your pitch deck. Check back here for updates.</p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="border-t border-slate-50 px-5 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Founder</p>
            <p className="mt-0.5 text-slate-700">{app.founder_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p>
            <p className="mt-0.5 text-slate-700">{app.email}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Requirements</p>
            <p className="mt-0.5 text-slate-600">{app.requirements}</p>
          </div>
        </div>

        <a
          href={app.pitch_deck_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-teal-700 ring-1 ring-slate-200 transition hover:bg-teal-50 hover:ring-teal-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Pitch Deck
        </a>
      </div>
    </div>
  );
}
