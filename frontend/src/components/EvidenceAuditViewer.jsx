import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Hash
} from 'lucide-react';

export default function EvidenceAuditViewer({
  candidates,
  matches,
  selectedCandidateId,
  onSelectCandidate
}) {
  const [activeCitationId, setActiveCitationId] = useState(null);

  const activeCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const activeMatch = matches.find((m) => m.candidate_id === activeCandidate?.id);

  if (!activeCandidate || !activeMatch) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
        Loading candidate audit trail...
      </div>
    );
  }

  const resumeLines = activeCandidate.raw_text.split('\n');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Evidence Audit & Grounding Inspector</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Line-by-Line Claim Verification & Audit Trail
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Every score and skill match is explicitly cited with resume line numbers, verbatim quotes, and confidence scores to prevent AI hallucinations.
            </p>
          </div>

          {/* Candidate Switcher Dropdown */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-medium">Candidate:</span>
            <select
              value={activeCandidate.id}
              onChange={(e) => onSelectCandidate(e.target.value)}
              aria-label="Select Candidate"
              className="bg-gray-800 text-sm font-semibold text-white px-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.current_role.split(' at ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Skill Citations, Right Resume Grounding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skill Verification & Flagged Claims (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Candidate Summary Pill */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white">{activeCandidate.name}</div>
              <div className="text-xs text-gray-400">{activeCandidate.current_role}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-indigo-400">{activeMatch.overall_match_score}%</div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Match Score</div>
            </div>
          </div>

          {/* Unverified / Flagged Gaps Section */}
          {activeMatch.unverified_claims.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Flagged Unverified Claims ({activeMatch.unverified_claims.length})</span>
              </div>
              <div className="space-y-2">
                {activeMatch.unverified_claims.map((claim, idx) => (
                  <div key={idx} className="text-xs text-amber-200/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
                    {claim}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Requirement Citations */}
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Skill Verification Matrix ({activeMatch.skill_breakdown.length})</span>
              </h3>
              <span className="text-[11px] text-gray-400">Click to highlight</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {activeMatch.skill_breakdown.map((item, idx) => {
                const isVerified = item.status === 'verified_match';
                const isPartial = item.status === 'partial_match';
                const isMissing = item.status === 'missing';

                return (
                  <div
                    key={idx}
                    onClick={() => item.line_number && setActiveCitationId(item.line_number)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      activeCitationId === item.line_number
                        ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950'
                        : isVerified
                        ? 'bg-gray-950/70 border-gray-800 hover:border-gray-700 text-gray-300'
                        : isPartial
                        ? 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40 text-amber-200'
                        : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isPartial ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className="text-xs font-bold text-white">{item.skill}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    {item.evidence_quote && (
                      <p className="text-[11px] text-gray-400 mt-2 italic bg-gray-900/90 p-2 rounded border border-gray-800/80">
                        "{item.evidence_quote}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                      <span>{item.note}</span>
                      {item.line_number && (
                        <span className="flex items-center space-x-0.5 text-indigo-400 font-semibold">
                          <Hash className="w-3 h-3" />
                          <span>Line {item.line_number}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Resume Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Source Resume Document Grounding</span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/40 border border-indigo-400"></span>
                <span>Active Target</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-400"></span>
                <span>Claim Probe</span>
              </span>
            </div>
          </div>

          {/* Line by line viewer */}
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/90 max-h-[620px] overflow-y-auto font-mono text-xs leading-relaxed space-y-1">
            {resumeLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isSelected = activeCitationId === lineNum;
              const citation = activeCandidate.evidence_citations.find((c) => c.line_number === lineNum);
              const isGapCitation = citation && citation.claim_type === 'gap';

              return (
                <div
                  key={idx}
                  onClick={() => citation && setActiveCitationId(lineNum)}
                  className={`flex items-start space-x-3 p-1 rounded transition ${
                    isSelected
                      ? 'bg-indigo-900/60 text-white font-semibold border-l-4 border-indigo-400 pl-2'
                      : isGapCitation
                      ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500/60 pl-2'
                      : citation
                      ? 'bg-emerald-950/20 text-gray-200 hover:bg-gray-800/50'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span className="w-8 flex-shrink-0 text-right text-gray-600 select-none font-mono text-[10px]">
                    {lineNum}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{line || ' '}</span>
                  {citation && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold flex-shrink-0 ${
                      isGapCitation ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {citation.claim_type} ({Math.round(citation.confidence_score * 100)}%)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
