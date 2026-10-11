import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Sparkles, 
  Send, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  MessageSquare,
  FileText,
  User,
  Bot,
  Flame,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LiveInterviewSimulator({
  candidates,
  matches,
  activeJd,
  selectedCandidateId,
  onSelectCandidate,
  onFetchQuestions,
  onEvaluateAnswer,
  onViewDossier
}) {
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const activeCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const activeMatch = matches.find((m) => m.candidate_id === activeCandidate?.id);

  // Load tailored questions when candidate changes
  useEffect(() => {
    if (activeCandidate) {
      loadQuestions(activeCandidate.id);
    }
  }, [activeCandidate?.id]);

  const loadQuestions = async (candId) => {
    setIsLoadingQuestions(true);
    setEvaluationResult(null);
    try {
      const qList = await onFetchQuestions(candId);
      setQuestions(qList || []);
      setActiveQuestionIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const currentQ = questions[activeQuestionIndex];

  // Helper sample answers for instant demo
  const sampleAnswersMap = {
    "cand-01": "In my previous role at Synthetix Labs, we engineered a hybrid RAG pipeline that combined Qdrant dense vector embeddings with BM25 sparse lexical search via Reciprocal Rank Fusion (RRF). We applied cross-encoder rerankers on the top 50 candidates, downsampling to top 5 chunks. For caching, we stored repeated query embeddings in Redis, bringing our P95 latency to 118ms for 2.5M daily queries.",
    "cand-02": "At CloudVenture, I built the AI application UI using Next.js and integrated with FastAPI and Milvus. Regarding the 10M QPS, we utilized AWS CloudFront edge caching for static assets and AWS Lambda with provisioned concurrency for inference routing.",
    "cand-03": "At NexaCloud, I managed 500-node GPU clusters on Kubernetes. We wrote custom Go operators for GPU scheduling and used Rust gRPC microservices for model telemetry.",
    "cand-04": "During my Ph.D. at MIT and at BioAnalytics, I trained deep neural networks and survival regression models using PyTorch, focusing on mathematical optimization and loss formulation.",
    "cand-05": "I built several web applications using React and CSS at DigitalCraft, and in my spare time I followed tutorials to build a chatbot using the OpenAI API."
  };

  const fillSampleAnswer = () => {
    const sample = sampleAnswersMap[activeCandidate?.id] || "We architected high-throughput microservices using asynchronous task queues, Redis caching, and schema validation with Pydantic.";
    setCandidateAnswer(sample);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!candidateAnswer.trim() || !currentQ) return;

    setIsEvaluating(true);
    try {
      const result = await onEvaluateAnswer({
        candidate_id: activeCandidate.id,
        question_id: currentQ.id,
        question_text: currentQ.question,
        candidate_answer: candidateAnswer,
        rubric: currentQ.expected_answer_rubric
      });

      setEvaluationResult(result);
      
      // Trigger confetti if high score!
      if (result.score >= 85) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }

      // Add to conversation history
      setHistory(prev => [
        ...prev,
        {
          question: currentQ.question,
          category: currentQ.category,
          answer: candidateAnswer,
          score: result.score,
          result: result
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Mic className="w-4 h-4" />
              <span>Live Interview Copilot & Evaluator</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Interactive AI Technical Interview Simulator
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Conduct dynamic technical interviews with tailored probing questions. The AI evaluates answers against rubrics in real-time, calculates live scores, and generates intelligent follow-ups.
            </p>
          </div>

          {/* Candidate Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400 font-medium">Candidate:</span>
            <select
              value={activeCandidate?.id}
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

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tailored Questions Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Tailored Question Bank ({questions.length})</span>
              </h3>
              <button
                onClick={() => loadQuestions(activeCandidate.id)}
                title="Regenerate questions"
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingQuestions ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Generating tailored questions...
              </div>
            ) : (
              <div className="space-y-2.5">
                {questions.map((q, idx) => {
                  const isSelected = activeQuestionIndex === idx;
                  const hasAnswered = history.some((h) => h.question === q.question);

                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => {
                        setActiveQuestionIndex(idx);
                        setEvaluationResult(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950'
                          : 'bg-gray-950/70 border-gray-800 hover:border-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className="text-indigo-400 uppercase tracking-wider">{q.category}</span>
                        {hasAnswered && (
                          <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Evaluated</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-200 line-clamp-2">{q.question}</p>
                      <div className="text-[10px] text-gray-400 mt-2 italic">
                        Target: {q.target_gap_or_claim}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Action to Dossier */}
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-3 text-center">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Completed Evaluation?</h4>
            <p className="text-xs text-gray-400">Synthesize all interview answers into the standardized executive hiring dossier.</p>
            <button
              onClick={() => onViewDossier(activeCandidate.id)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Compile Executive Dossier</span>
            </button>
          </div>
        </div>

        {/* Right: Active Question & Live Evaluation Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentQ && (
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-5 shadow-xl">
              {/* Question Header */}
              <div className="space-y-2 pb-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentQ.category}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Difficulty: {currentQ.difficulty}</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  {currentQ.question}
                </h2>
                <div className="text-xs text-indigo-400 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-500/20">
                  <span className="font-bold">Interviewer Rationale: </span>{currentQ.rationale}
                </div>
              </div>

              {/* Expected Rubric Preview */}
              <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-800 space-y-2">
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evaluation Rubric Criteria</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{currentQ.expected_answer_rubric}</p>
                {currentQ.red_flags && currentQ.red_flags.length > 0 && (
                  <div className="pt-2 text-xs text-rose-300/90 space-y-1">
                    <span className="font-bold text-rose-400">🚩 Red Flags to Probe: </span>
                    {currentQ.red_flags.join(' • ')}
                  </div>
                )}
              </div>

              {/* Answer Input Area */}
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <label className="font-semibold flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate's Response:</span>
                  </label>
                  <button
                    type="button"
                    onClick={fillSampleAnswer}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Load Sample Candidate Answer
                  </button>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Enter candidate's response or click 'Load Sample Candidate Answer' for instant demo..."
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isEvaluating || !candidateAnswer.trim()}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI Evaluating Response...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Evaluate Response Live</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Real-time Evaluation Results Panel */}
              {evaluationResult && (
                <div className="bg-gradient-to-b from-gray-900 to-indigo-950/50 p-6 rounded-2xl border border-indigo-500/40 space-y-5 animate-in fade-in duration-300 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-indigo-500/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Live AI Turn Scorecard</div>
                        <div className="text-xs text-indigo-300 font-medium">Status: {evaluationResult.evidence_status_update.replace('_', ' ').toUpperCase()}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-400">{evaluationResult.score}/100</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400">Response Score</div>
                    </div>
                  </div>

                  {/* Rubric Breakdown Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(evaluationResult.rubric_score_breakdown).map(([key, val]) => (
                      <div key={key} className="bg-gray-950/70 p-3 rounded-xl border border-gray-800">
                        <div className="text-[10px] text-gray-400 uppercase font-semibold truncate mb-1">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-lg font-bold text-white">{val}%</div>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strengths and Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Key Strengths</span>
                      </div>
                      <ul className="space-y-1 text-xs text-emerald-200">
                        {evaluationResult.key_strengths.map((s, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span>•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-950/30 border border-amber-500/20 p-4 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Areas to Probe</span>
                      </div>
                      <ul className="space-y-1 text-xs text-amber-200">
                        {evaluationResult.areas_of_concern.map((c, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span>•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Adaptive Follow-up Generated */}
                  {evaluationResult.follow_up_question && (
                    <div className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-indigo-400" />
                        <span>Adaptive Follow-Up Probing Question</span>
                      </div>
                      <p className="text-xs text-indigo-100 font-medium leading-relaxed italic">
                        "{evaluationResult.follow_up_question}"
                      </p>
                      <div className="text-[11px] text-gray-400 pt-1 border-t border-indigo-500/20">
                        💡 <span className="font-semibold text-gray-300">Recruiter Tip: </span>
                        {evaluationResult.coaching_tip_for_recruiter}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
