import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  Award,
  ListFilter,
  FileText,
  Building
} from 'lucide-react';

export default function JobWorkspace({ jds, activeJd, onSelectJd, onParseNewJd }) {
  const [isCreating, setIsCreating] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      await onParseNewJd(rawText, customTitle);
      setIsCreating(false);
      setRawText('');
      setCustomTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Job Intelligence Agent</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Role Requirements & Evaluation Rubrics
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            HireFlow automatically breaks down unstructured job descriptions into weighted mandatory criteria, preferred qualifications, and behavioral signals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isCreating ? 'Cancel' : 'Parse New JD'}</span>
          </button>
        </div>
      </div>

      {/* New JD Parse Form Drawer */}
      {isCreating && (
        <div className="bg-gray-900 p-6 rounded-2xl border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Extract Structured Requirements from Raw Job Text</span>
          </div>
          <form onSubmit={handleParse} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Custom Role Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Machine Learning Infrastructure Engineer"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Paste Job Description Text</label>
              <textarea
                rows={6}
                required
                placeholder="Paste the full job description here. The JD Intelligence Agent will extract skills, experience levels, responsibilities, and weightings automatically..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isParsing}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {isParsing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI Parsing Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run JD Agent & Match Candidates</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        {jds.map((jd) => {
          const isSelected = activeJd?.id === jd.id;
          return (
            <button
              key={jd.id}
              onClick={() => onSelectJd(jd.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950'
                  : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700'
              }`}
            >
              <Building className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
              <div>
                <div className="text-sm font-semibold">{jd.title}</div>
                <div className="text-xs text-gray-400">{jd.department} • {jd.experience_level}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active JD Detail Cards */}
      {activeJd && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeJd.title}</h2>
                  <p className="text-sm text-indigo-400 mt-0.5">{activeJd.department}</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">
                    Min {activeJd.min_years_experience}+ Years Experience
                  </span>
                </div>
              </div>

              {/* Mandatory Skills */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mandatory Core Skills ({activeJd.mandatory_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeJd.mandatory_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {activeJd.preferred_skills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Preferred / Nice-to-Have Skills ({activeJd.preferred_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeJd.preferred_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Key Responsibilities & Deliverables</span>
                </div>
                <ul className="space-y-2">
                  {activeJd.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-gray-300">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar Values & Raw JD */}
          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Culture & Behavioral Rubrics</span>
              </h3>
              <div className="space-y-2">
                {activeJd.culture_values.map((v, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Original JD Text</span>
              </h3>
              <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-800/80 max-h-56 overflow-y-auto text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
                {activeJd.raw_text}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
