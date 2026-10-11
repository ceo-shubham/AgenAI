import React from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Users, 
  Search, 
  Mic, 
  FileText, 
  Scale, 
  ShieldCheck, 
  RotateCcw,
  Cpu
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  jds, 
  activeJd, 
  onSelectJd, 
  onReset,
  isGeminiConfigured 
}) {
  const tabs = [
    { id: 'pipeline', label: 'Screening Pipeline', icon: Users },
    { id: 'audit', label: 'Evidence Audit Trail', icon: ShieldCheck },
    { id: 'interview', label: 'Live AI Interview', icon: Mic },
    { id: 'search', label: 'Candidate Pool Q&A', icon: Search },
    { id: 'compare', label: 'Side-by-Side Compare', icon: Scale },
    { id: 'dossier', label: 'Executive Dossier', icon: FileText },
    { id: 'job', label: 'Job Requirements', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">HireFlow</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-gray-400">Candidate Screening & Interview Intelligence</p>
            </div>
          </div>

          {/* Active Job Selector */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-gray-400">Target Role:</span>
            <select
              value={activeJd?.id || ''}
              onChange={(e) => onSelectJd(e.target.value)}
              aria-label="Target Role"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
            >
              {jds.map((jd) => (
                <option key={jd.id} value={jd.id} className="bg-gray-800 text-white">
                  {jd.title} ({jd.experience_level})
                </option>
              ))}
            </select>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Agent Active</span>
            </div>

            <button
              onClick={onReset}
              title="Reset to Sample Demo Dataset"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-gray-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
