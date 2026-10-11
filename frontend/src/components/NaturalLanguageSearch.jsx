import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Send, 
  User, 
  ArrowRight, 
  Lightbulb, 
  ShieldAlert, 
  CheckCircle2,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export default function NaturalLanguageSearch({
  candidates,
  matches,
  onQueryPool,
  onSelectCandidate,
  onStartInterview,
  onViewAudit
}) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const samplePrompts = [
    "Who has experience with PyTorch and low-latency RAG?",
    "Which candidates have unverified claims or gaps?",
    "Show candidates with 5+ years of experience",
    "Who is strongest in distributed systems & Kubernetes?",
    "How does Alex Rivera fit the Senior AI Engineer role?"
  ];

  const handleSearch = async (queryString) => {
    const q = queryString || query;
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const res = await onQueryPool(q);
      setQueryResult(res);
      setQuery(q);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Candidate Pool Intelligence Assistant</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Recruiter Natural Language Query Engine
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Ask complex questions across your entire candidate pool in plain English to uncover hidden strengths, spot inconsistencies, and benchmark qualifications.
        </p>
      </div>

      {/* Query Search Bar */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-3 bg-gray-950 p-2 rounded-xl border border-gray-800 focus-within:border-indigo-500">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Ask anything (e.g. 'Find candidates who have built high-throughput RAG pipelines and led teams')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Ask Agent</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 no-scrollbar">
          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Try:</span>
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(prompt)}
              className="text-xs px-3 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Card */}
      {queryResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Direct Answer & Insights */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-indigo-500/30 space-y-5">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Intelligence Synthesis</div>
                <div className="text-sm text-gray-100 leading-relaxed font-medium">
                  {queryResult.answer}
                </div>
              </div>
            </div>

            {/* Key Insights Bullets */}
            {queryResult.key_insights && queryResult.key_insights.length > 0 && (
              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">Key Candidate Insights</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {queryResult.key_insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-gray-300 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/80">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up Queries */}
            {queryResult.suggested_follow_up_queries && queryResult.suggested_follow_up_queries.length > 0 && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="text-xs font-semibold text-gray-400">Suggested Follow-ups:</div>
                <div className="flex flex-wrap gap-2">
                  {queryResult.suggested_follow_up_queries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(q)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Matched Candidate Cards */}
          {queryResult.matched_candidate_ids && queryResult.matched_candidate_ids.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Referenced Candidate Profiles ({queryResult.matched_candidate_ids.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queryResult.matched_candidate_ids.map((id) => {
                  const cand = candidates.find((c) => c.id === id);
                  const match = matches.find((m) => m.candidate_id === id);
                  if (!cand || !match) return null;

                  return (
                    <div
                      key={id}
                      className="bg-gray-900 p-5 rounded-xl border border-gray-800 hover:border-indigo-500/40 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{cand.name}</div>
                          <div className="text-xs text-gray-400">{cand.current_role}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-indigo-400">{match.overall_match_score}%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {cand.top_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                        <button
                          onClick={() => onViewAudit(cand.id)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View Audit Trail
                        </button>
                        <button
                          onClick={() => onStartInterview(cand.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                        >
                          Interview
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
