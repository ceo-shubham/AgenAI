import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Printer, 
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function EvaluationReport({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onFetchDossier
}) {
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  useEffect(() => {
    if (activeCandidate) {
      loadDossier(activeCandidate.id);
    }
  }, [activeCandidate?.id]);

  const loadDossier = async (candId) => {
    setIsLoading(true);
    try {
      const res = await onFetchDossier(candId);
      setDossier(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    if (!dossier) return;
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HireFlow_Dossier_${dossier.candidate_name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const getRecommendationBadge = (rec) => {
    if (rec === 'Strong Hire') {
      return <span className="px-4 py-1.5 text-sm font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">★ STRONG HIRE</span>;
    }
    if (rec === 'Hire') {
      return <span className="px-4 py-1.5 text-sm font-black rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">✓ HIRE</span>;
    }
    if (rec === 'Lean No Hire') {
      return <span className="px-4 py-1.5 text-sm font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">⚠ LEAN NO HIRE</span>;
    }
    return <span className="px-4 py-1.5 text-sm font-black rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">✕ NO HIRE</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Controls Banner (Screen Only) */}
      <div className="print:hidden bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Standardized Evaluation Dossier</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Candidate Hiring Evaluation Dossier
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={activeCandidate?.id}
            onChange={(e) => onSelectCandidate(e.target.value)}
            aria-label="Select Candidate"
            className="bg-gray-800 text-xs font-semibold text-white px-3 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {isLoading || !dossier ? (
        <div className="py-16 text-center text-gray-400 text-sm">
          Compiling standardized hiring dossier and audit citations...
        </div>
      ) : (
        /* Printable Document Container */
        <div className="bg-gray-900 p-8 sm:p-10 rounded-3xl border border-gray-800 space-y-8 shadow-2xl print:bg-white print:text-gray-900 print:border-none print:p-0">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800 print:border-gray-300">
            <div>
              <div className="text-xs font-bold text-indigo-400 print:text-indigo-600 uppercase tracking-widest">
                HIREFLOW STANDARDIZED EVALUATION DOSSIER
              </div>
              <h2 className="text-3xl font-black text-white print:text-gray-900 mt-1">
                {dossier.candidate_name}
              </h2>
              <div className="text-sm text-gray-400 print:text-gray-600 mt-1">
                Target Position: <span className="font-semibold text-gray-200 print:text-gray-800">{dossier.target_role}</span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end space-y-2">
              {getRecommendationBadge(dossier.final_hiring_recommendation)}
              <div className="text-xs text-gray-400 print:text-gray-600">
                Composite Score: <span className="font-bold text-lg text-indigo-400 print:text-indigo-700">{dossier.final_composite_score}/100</span>
              </div>
            </div>
          </div>

          {/* Dual Scorecard Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 print:bg-gray-50 print:border-gray-200 text-center">
              <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold">Initial Resume Match</div>
              <div className="text-2xl font-black text-white print:text-gray-900 mt-1">{dossier.initial_match_score}%</div>
              <div className="text-[10px] text-gray-500">Weight: 40%</div>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 print:bg-gray-50 print:border-gray-200 text-center">
              <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold">Live Interview Performance</div>
              <div className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-1">{dossier.interview_performance_score}%</div>
              <div className="text-[10px] text-gray-500">Weight: 60%</div>
            </div>
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 print:bg-gray-50 print:border-gray-200 text-center">
              <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold">Final Composite</div>
              <div className="text-2xl font-black text-indigo-400 print:text-indigo-700 mt-1">{dossier.final_composite_score}%</div>
              <div className="text-[10px] text-gray-500">Hiring Threshold: 70%</div>
            </div>
          </div>

          {/* Hiring Manager Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 print:text-gray-700 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 print:text-indigo-600" />
              <span>Executive Briefing for Hiring Committee</span>
            </h3>
            <p className="text-sm text-gray-200 print:text-gray-800 leading-relaxed bg-gray-950/60 print:bg-gray-50 p-4 rounded-xl border border-gray-800 print:border-gray-200">
              {dossier.summary_for_hiring_manager}
            </p>
          </div>

          {/* Strengths and Gaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Core Strengths</span>
              </div>
              <div className="space-y-2">
                {dossier.verified_strengths.map((str, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-emerald-200 print:text-emerald-900 bg-emerald-950/20 print:bg-emerald-50 p-3 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-400 print:text-amber-700 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Limitations & Risks</span>
              </div>
              <div className="space-y-2">
                {dossier.confirmed_gaps.map((gap, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-amber-200 print:text-amber-900 bg-amber-950/20 print:bg-amber-50 p-3 rounded-lg border border-amber-500/20">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{gap}</span>
                  </div>
                ))}
                {dossier.unanswered_risks.map((risk, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-rose-200 print:text-rose-900 bg-rose-950/20 print:bg-rose-50 p-3 rounded-lg border border-rose-500/20">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Audit Citations Table */}
          {dossier.audit_trail_citations && dossier.audit_trail_citations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-300 print:text-gray-700 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 print:text-indigo-600" />
                <span>Evidence Grounding & Source Citations</span>
              </h3>
              <div className="bg-gray-950 print:bg-gray-50 rounded-xl border border-gray-800 print:border-gray-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-800/80 print:bg-gray-200 text-gray-400 print:text-gray-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Claim & Summary</th>
                      <th className="p-3">Exact Resume Quote</th>
                      <th className="p-3">Line #</th>
                      <th className="p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 print:divide-gray-200">
                    {dossier.audit_trail_citations.map((cite, idx) => (
                      <tr key={idx} className="text-gray-300 print:text-gray-800">
                        <td className="p-3 font-medium text-white print:text-gray-900">{cite.summary}</td>
                        <td className="p-3 italic text-gray-400 print:text-gray-600">"{cite.quote}"</td>
                        <td className="p-3 font-mono text-indigo-400 print:text-indigo-700 font-bold">L{cite.line_number}</td>
                        <td className="p-3 font-semibold">{Math.round(cite.confidence * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actionable Next Steps */}
          <div className="space-y-3 pt-4 border-t border-gray-800 print:border-gray-300">
            <h3 className="text-xs font-bold text-gray-300 print:text-gray-700 uppercase tracking-wider">
              Recommended Hiring Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {dossier.next_steps.map((step, idx) => (
                <div key={idx} className="bg-gray-950 print:bg-gray-50 p-3.5 rounded-xl border border-gray-800 print:border-gray-200 text-xs text-gray-300 print:text-gray-800 space-y-1">
                  <div className="font-bold text-indigo-400 print:text-indigo-700 text-[10px] uppercase">Step {idx + 1}</div>
                  <div>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
