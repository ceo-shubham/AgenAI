import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Mic, 
  FileText, 
  Scale, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  ExternalLink,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function CandidateLeaderboard({
  candidates,
  matches,
  activeJd,
  onSelectCandidate,
  onStartInterview,
  onViewAudit,
  onViewDossier,
  onToggleCompare,
  selectedCompareIds,
  onUploadResume
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter candidates
  const filteredMatches = matches.filter((match) => {
    const cand = candidates.find((c) => c.id === match.candidate_id);
    if (!cand) return false;

    const matchesSearch = 
      cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.current_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.top_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterTier === 'ALL') return matchesSearch;
    if (filterTier === 'STRONG') return matchesSearch && match.status_tier === 'Strong Match';
    if (filterTier === 'POTENTIAL') return matchesSearch && match.status_tier === 'Potential Fit';
    if (filterTier === 'UNDERQUALIFIED') return matchesSearch && match.status_tier === 'Underqualified';
    return matchesSearch;
  });

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    setIsSubmitting(true);
    try {
      await onUploadResume(uploadText, uploadName);
      setIsUploading(false);
      setUploadText('');
      setUploadName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getTierBadge = (tier) => {
    if (tier === 'Strong Match') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Strong Match</span>;
    }
    if (tier === 'Potential Fit') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Potential Fit</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Underqualified</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Screening Matrix & Leaderboard</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Candidate Pipeline for {activeJd?.title || 'Active Role'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Grounded multi-dimensional evaluation: Technical Skills (45%), Experience Fit (30%), Soft Skills (15%), Education (10%).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isUploading ? 'Cancel' : 'Add Candidate Resume'}</span>
          </button>
        </div>
      </div>

      {/* Upload Modal / Drawer */}
      {isUploading && (
        <div className="bg-gray-900 p-6 rounded-2xl border border-indigo-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Ingest & Extract Candidate Resume</span>
          </div>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Candidate Full Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Jordan Lee"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Paste Resume Text / Work History</label>
              <textarea
                rows={6}
                required
                placeholder="Paste the resume content or work experience summary. The Resume Parsing Agent will extract chronological history, verified skills, and line citations..."
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsUploading(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'AI Parsing Resume...' : 'Parse & Score Candidate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/70 p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidates or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-gray-400 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Tier:</span>
          </span>
          {['ALL', 'STRONG', 'POTENTIAL', 'UNDERQUALIFIED'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterTier === tier
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline Cards */}
      <div className="space-y-4">
        {filteredMatches.map((match, rankIdx) => {
          const cand = candidates.find((c) => c.id === match.candidate_id);
          if (!cand) return null;
          const isCompared = selectedCompareIds.includes(cand.id);

          return (
            <div
              key={cand.id}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-6 hover:border-indigo-500/40 transition shadow-lg space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-base text-white">
                    #{rankIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition cursor-pointer"
                          onClick={() => onViewAudit(cand.id)}>
                        {cand.name}
                      </h3>
                      {getTierBadge(match.status_tier)}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{cand.current_role} • {cand.location || 'Remote'}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{cand.total_experience_years} Yrs Exp (Req: {activeJd.min_years_experience}+)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{cand.education}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Composite Match Score */}
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(match.overall_match_score)}`}>
                    <div className="text-2xl font-black">{match.overall_match_score}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider">Overall Fit</div>
                  </div>
                </div>
              </div>

              {/* Sub-Score Progress Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-950/60 p-3.5 rounded-xl border border-gray-800/80">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Technical Match (45%)</span>
                    <span className="font-semibold text-white">{match.technical_skill_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${match.technical_skill_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Experience Fit (30%)</span>
                    <span className="font-semibold text-white">{match.experience_fit_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${match.experience_fit_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Soft & Leadership (15%)</span>
                    <span className="font-semibold text-white">{match.soft_skill_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${match.soft_skill_score}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Education (10%)</span>
                    <span className="font-semibold text-white">{match.education_fit_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${match.education_fit_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Verified vs Missing Skills Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-gray-400 font-semibold mr-1">Verified:</span>
                  {match.matched_skills.map((s, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{s}</span>
                    </span>
                  ))}
                  {match.missing_skills.length > 0 && (
                    <>
                      <span className="text-xs text-gray-400 font-semibold ml-2 mr-1">Missing:</span>
                      {match.missing_skills.map((s, i) => (
                        <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>{s}</span>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Gap / Warning Alerts */}
              {(match.unverified_claims.length > 0 || match.gap_warnings.length > 0) && (
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-200/90 space-y-1">
                    <span className="font-semibold text-amber-300">Flagged for Interview Validation: </span>
                    {match.unverified_claims.length > 0 ? match.unverified_claims[0] : match.gap_warnings[0]}
                  </div>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-gray-400 italic">
                  💡 {match.recommendation}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleCompare(cand.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isCompared 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => onViewAudit(cand.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-gray-700 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Audit Citations</span>
                  </button>

                  <button
                    onClick={() => onStartInterview(cand.id)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Live AI Interview</span>
                  </button>

                  <button
                    onClick={() => onViewDossier(cand.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
