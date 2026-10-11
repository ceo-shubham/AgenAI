import React from 'react';
import { 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  Briefcase, 
  GraduationCap,
  Sparkles,
  ExternalLink,
  Mic,
  ShieldCheck
} from 'lucide-react';

export default function ComparisonMatrix({
  candidates,
  matches,
  activeJd,
  selectedCompareIds,
  onToggleCompare,
  onStartInterview,
  onViewAudit
}) {
  const comparedCandidates = candidates.filter((c) => selectedCompareIds.includes(c.id));
  const comparedMatches = matches.filter((m) => selectedCompareIds.includes(m.candidate_id));

  // If none selected, default to top 2
  const activeList = comparedCandidates.length > 0 
    ? comparedCandidates 
    : candidates.slice(0, 2);

  const activeMatchList = activeList.map(c => matches.find(m => m.candidate_id === c.id)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Side-by-Side Calibration</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Candidate Benchmark Comparison Matrix
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Compare candidate qualifications, verified skill depth, identified gap risks, and hiring recommendations for {activeJd?.title}.
            </p>
          </div>

          {/* Quick Select Checkboxes */}
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => {
              const isSelected = selectedCompareIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onToggleCompare(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {c.name.split(' ')[0]} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(activeList.length, 3)} gap-6`}>
        {activeList.map((cand) => {
          const match = matches.find((m) => m.candidate_id === cand.id);
          if (!match) return null;

          return (
            <div
              key={cand.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">{cand.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cand.current_role}</p>
                    <div className="text-[11px] text-indigo-400 mt-1">{cand.education}</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="text-2xl font-black text-indigo-400">{match.overall_match_score}%</div>
                    <div className="text-[9px] uppercase font-bold text-gray-400">Match</div>
                  </div>
                </div>

                {/* Score Breakdown Radar */}
                <div className="space-y-2 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">Score Breakdown</div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                        <span>Technical Fit (45%)</span>
                        <span className="font-semibold text-white">{match.technical_skill_score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${match.technical_skill_score}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                        <span>Experience (30%)</span>
                        <span className="font-semibold text-white">{match.experience_fit_score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${match.experience_fit_score}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-0.5">
                        <span>Soft & Leadership (15%)</span>
                        <span className="font-semibold text-white">{match.soft_skill_score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${match.soft_skill_score}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified Skills */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Core Skills ({match.matched_skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {match.matched_skills.map((s, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                {match.missing_skills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Missing Mandatory Skills ({match.missing_skills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.missing_skills.map((s, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk / Unverified Gaps */}
                {(match.unverified_claims.length > 0 || match.gap_warnings.length > 0) && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Validation Flag</span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {match.unverified_claims[0] || match.gap_warnings[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewAudit(cand.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-gray-700 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit</span>
                </button>
                <button
                  onClick={() => onStartInterview(cand.id)}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Interview</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
