import { useState, useRef } from 'react';
import { supabase, PITCH_DECKS_BUCKET } from '@/lib/supabase';
import type { ApplicationInput } from '@/types/application';
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Rocket,
  Mail,
  User,
  Building2,
  ClipboardList,
  TrendingUp,
  Lightbulb,
  Users,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';

interface FounderFormProps {
  onSubmitted: () => void;
}

const perks = [
  { icon: TrendingUp, label: 'Seed Funding', desc: 'Up to $250K initial investment' },
  { icon: Users, label: 'Mentorship', desc: '1-on-1 with industry veterans' },
  { icon: Lightbulb, label: 'Lab Access', desc: 'State-of-the-art R&D facilities' },
];

export default function FounderForm({ onSubmitted }: FounderFormProps) {
  const [formData, setFormData] = useState({
    startup_name: '',
    founder_name: '',
    email: '',
    requirements: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.type !== 'application/pdf') {
      setFileError('Please upload a PDF file.');
      setFile(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileError('File size must be under 10 MB.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): boolean => {
    if (!formData.startup_name.trim()) {
      setError('Startup name is required.');
      return false;
    }
    if (!formData.founder_name.trim()) {
      setError('Founder name is required.');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('A valid email address is required.');
      return false;
    }
    if (!formData.requirements.trim()) {
      setError('Please describe the resources you need.');
      return false;
    }
    if (!file) {
      setError('A pitch deck PDF is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const fileExt = file!.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;
      const filePath = `pitch-decks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(PITCH_DECKS_BUCKET)
        .upload(filePath, file!, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(PITCH_DECKS_BUCKET)
        .getPublicUrl(filePath);

      const input: ApplicationInput = {
        startup_name: formData.startup_name.trim(),
        founder_name: formData.founder_name.trim(),
        email: formData.email.trim(),
        requirements: formData.requirements.trim(),
        pitch_deck_url: publicUrlData.publicUrl,
      };

      const { error: insertError } = await supabase
        .from('applications')
        .insert(input);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({ startup_name: '', founder_name: '', email: '', requirements: '' });
      removeFile();
      onSubmitted();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldClass = (fieldName: string) =>
    `w-full rounded-xl border bg-white px-4 py-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:outline-none ${
      focusedField === fieldName
        ? 'border-teal-500 ring-4 ring-teal-500/15 shadow-sm'
        : 'border-slate-200 hover:border-slate-300'
    }`;

  if (success) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center px-4">
        {/* Confetti dots */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full animate-bounce-in"
              style={{
                left: `${10 + i * 7}%`,
                top: `${20 + (i % 3) * 20}%`,
                backgroundColor: ['#14b8a6', '#06b6d4', '#10b981', '#f59e0b'][i % 4],
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-md scale-in rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-2xl shadow-slate-300/40">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-400/30" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/40">
              <PartyPopper className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Application Submitted!</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Your startup application is now{' '}
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Under Review
            </span>
            <br />
            Our team will evaluate your pitch deck and get back to you soon.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:gap-3 hover:bg-slate-800"
          >
            Submit Another Application
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      {/* Hero banner */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-8 text-white shadow-2xl shadow-slate-400/20 sm:p-12">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-white/10">
            <SparkleDot />
            Now accepting applications
          </div>
          <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">
            Turn your vision into a funded startup
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
            Apply for our incubation program and get access to funding, mentorship,
            and world-class facilities designed to help early-stage founders succeed.
          </p>

          {/* Perks */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {perks.map((perk, i) => (
              <div
                key={perk.label}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/10 animate-fade-in-up animation-fill-back"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/30">
                  <perk.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{perk.label}</p>
                  <p className="text-xs text-slate-400">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 transition sm:p-8 animate-fade-in-up"
      >
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/30">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
        </div>

        {/* Two-column row on desktop */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Startup Name
            </label>
            <div className="relative">
              <Building2 className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focusedField === 'startup_name' ? 'text-teal-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="startup_name"
                value={formData.startup_name}
                onChange={handleChange}
                onFocus={() => setFocusedField('startup_name')}
                onBlur={() => setFocusedField('')}
                placeholder="e.g. Nova Robotics"
                className={getFieldClass('startup_name')}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Founder Name
            </label>
            <div className="relative">
              <User className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focusedField === 'founder_name' ? 'text-teal-500' : 'text-slate-400'}`} />
              <input
                type="text"
                name="founder_name"
                value={formData.founder_name}
                onChange={handleChange}
                onFocus={() => setFocusedField('founder_name')}
                onBlur={() => setFocusedField('')}
                placeholder="e.g. Jane Doe"
                className={getFieldClass('founder_name')}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-teal-500' : 'text-slate-400'}`} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              placeholder="founder@startup.com"
              className={getFieldClass('email')}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Requirements Needed
          </label>
          <div className="relative">
            <ClipboardList className={`pointer-events-none absolute left-3.5 top-4 h-4 w-4 transition-colors ${focusedField === 'requirements' ? 'text-teal-500' : 'text-slate-400'}`} />
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              onFocus={() => setFocusedField('requirements')}
              onBlur={() => setFocusedField('')}
              rows={4}
              placeholder="Describe the resources you need — funding, office space, lab access, mentorship, etc."
              className={getFieldClass('requirements')}
            />
          </div>
          {/* Char counter */}
          {formData.requirements.length > 0 && (
            <p className="mt-1 text-right text-xs text-slate-400">
              {formData.requirements.length} characters
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Pitch Deck (PDF)
          </label>
          {!file ? (
            <label
              htmlFor="pitch-deck-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center transition-all duration-300 hover:border-teal-400 hover:bg-teal-50/30"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-100">
                <Upload className="h-6 w-6 text-slate-400 transition-colors group-hover:text-teal-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">
                Click to upload your pitch deck
              </span>
              <span className="mt-1 text-xs text-slate-400">PDF format, max 10 MB</span>
              <input
                id="pitch-deck-upload"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-3.5 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                  <FileText className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <span className="block truncate text-sm font-medium text-slate-700">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-100 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {fileError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 animate-fade-in">
              <AlertCircle className="h-3.5 w-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 animate-fade-in ring-1 ring-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {/* Shine effect */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Submit Application
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function SparkleDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
    </span>
  );
}
