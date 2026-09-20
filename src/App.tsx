import { useState } from 'react';
import FounderForm from '@/components/FounderForm';
import AdminPortal from '@/components/AdminPortal';
import TrackApplication from '@/components/TrackApplication';
import { Rocket, LayoutDashboard, FileText, Sparkles, Search } from 'lucide-react';

type Tab = 'founder' | 'admin' | 'track';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('founder');
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [founderRefreshKey, setFounderRefreshKey] = useState(0);

  const triggerAdminRefresh = () => setAdminRefreshKey((k) => k + 1);
  const triggerFounderRefresh = () => setFounderRefreshKey((k) => k + 1);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-200/30 to-cyan-200/20 blur-3xl animate-float" />
        <div className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-200/20 to-blue-200/20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-emerald-200/20 to-teal-200/10 blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/40">
              <Rocket className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 opacity-0 blur-md transition-opacity duration-300 hover:opacity-60" />
            </div>
            <div>
              <h1 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-slate-900">
                Incubation Portal
              </h1>
              <p className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                <Sparkles className="h-3 w-3 text-teal-400" />
                Startup incubation application &amp; review platform
              </p>
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="flex gap-1 rounded-2xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/60">
            <button
              onClick={() => setActiveTab('founder')}
              className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 sm:px-5 ${
                activeTab === 'founder'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className={`h-4 w-4 transition-transform duration-300 ${activeTab === 'founder' ? 'scale-110 text-teal-600' : 'group-hover:scale-110'}`} />
              <span className="hidden sm:inline">Founder Form</span>
              <span className="sm:hidden">Apply</span>
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 sm:px-5 ${
                activeTab === 'track'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Search className={`h-4 w-4 transition-transform duration-300 ${activeTab === 'track' ? 'scale-110 text-teal-600' : 'group-hover:scale-110'}`} />
              <span className="hidden sm:inline">Track Status</span>
              <span className="sm:hidden">Track</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                triggerAdminRefresh();
              }}
              className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 sm:px-5 ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-300/40'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 transition-transform duration-300 ${activeTab === 'admin' ? 'scale-110 text-teal-600' : 'group-hover:scale-110'}`} />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10">
        {activeTab === 'founder' && (
          <div key={`founder-${founderRefreshKey}`} className="animate-fade-in">
            <FounderForm onSubmitted={triggerAdminRefresh} />
          </div>
        )}
        {activeTab === 'track' && (
          <div key="track" className="animate-fade-in">
            <TrackApplication onSubmitted={triggerAdminRefresh} />
          </div>
        )}
        {activeTab === 'admin' && (
          <div key={`admin-${adminRefreshKey}`} className="animate-fade-in">
            <AdminPortal refreshKey={adminRefreshKey} onDecision={triggerFounderRefresh} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 py-6 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400">
          Startup Incubation Portal — Empowering early-stage founders
        </div>
      </footer>
    </div>
  );
}
