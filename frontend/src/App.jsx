import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JobWorkspace from './components/JobWorkspace';
import CandidateLeaderboard from './components/CandidateLeaderboard';
import EvidenceAuditViewer from './components/EvidenceAuditViewer';
import NaturalLanguageSearch from './components/NaturalLanguageSearch';
import LiveInterviewSimulator from './components/LiveInterviewSimulator';
import ComparisonMatrix from './components/ComparisonMatrix';
import EvaluationReport from './components/EvaluationReport';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [jds, setJds] = useState([]);
  const [activeJd, setActiveJd] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Health check
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setIsGeminiConfigured(healthData.gemini_api_configured);

      // 2. JDs
      const jdsRes = await fetch('/api/jds');
      const jdsData = await jdsRes.json();
      setJds(jdsData);

      // 3. Active JD
      const activeJdRes = await fetch('/api/jds/active');
      const activeJdData = await activeJdRes.json();
      setActiveJd(activeJdData);

      // 4. Candidates
      const candRes = await fetch('/api/candidates');
      const candData = await candRes.json();
      setCandidates(candData);
      if (candData.length > 0 && !selectedCandidateId) {
        setSelectedCandidateId(candData[0].id);
        setSelectedCompareIds([candData[0].id, candData[1]?.id].filter(Boolean));
      }

      // 5. Matches
      const matchRes = await fetch('/api/match/all');
      const matchData = await matchRes.json();
      setMatches(matchData);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJd = async (jdId) => {
    try {
      const res = await fetch(`/api/jds/select/${jdId}`, { method: 'POST' });
      const updatedJd = await res.json();
      setActiveJd(updatedJd);

      // Refresh matches for the new JD
      const matchRes = await fetch('/api/match/all');
      const matchData = await matchRes.json();
      setMatches(matchData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleParseNewJd = async (rawText, customTitle) => {
    const res = await fetch('/api/jds/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText, custom_title: customTitle })
    });
    const newJd = await res.json();
    setJds(prev => [newJd, ...prev]);
    setActiveJd(newJd);

    // Refresh matches
    const matchRes = await fetch('/api/match/all');
    const matchData = await matchRes.json();
    setMatches(matchData);
    setActiveTab('pipeline');
  };

  const handleUploadResume = async (rawText, candidateName) => {
    const res = await fetch('/api/candidates/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText, candidate_name: candidateName })
    });
    const newCand = await res.json();
    setCandidates(prev => [newCand, ...prev]);
    setSelectedCandidateId(newCand.id);

    // Refresh matches
    const matchRes = await fetch('/api/match/all');
    const matchData = await matchRes.json();
    setMatches(matchData);
  };

  const handleQueryPool = async (queryString) => {
    const res = await fetch('/api/candidates/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryString })
    });
    return await res.json();
  };

  const handleFetchQuestions = async (candId) => {
    const res = await fetch(`/api/interview/questions/${candId}`);
    return await res.json();
  };

  const handleEvaluateAnswer = async (payload) => {
    const res = await fetch('/api/interview/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  };

  const handleFetchDossier = async (candId) => {
    const res = await fetch(`/api/interview/dossier/${candId}`);
    return await res.json();
  };

  const handleToggleCompare = (candId) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(candId)) {
        return prev.filter(id => id !== candId);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), candId];
        }
        return [...prev, candId];
      }
    });
  };

  const handleReset = async () => {
    await fetch('/api/reset', { method: 'POST' });
    await fetchInitialData();
  };

  // Nav actions
  const startInterview = (candId) => {
    setSelectedCandidateId(candId);
    setActiveTab('interview');
  };

  const viewAudit = (candId) => {
    setSelectedCandidateId(candId);
    setActiveTab('audit');
  };

  const viewDossier = (candId) => {
    setSelectedCandidateId(candId);
    setActiveTab('dossier');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center animate-bounce shadow-xl shadow-indigo-600/40">
          <span className="font-black text-xl">HF</span>
        </div>
        <div className="text-sm font-semibold text-gray-300">Initializing HireFlow Multi-Agent Engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jds={jds}
        activeJd={activeJd}
        onSelectJd={handleSelectJd}
        onReset={handleReset}
        isGeminiConfigured={isGeminiConfigured}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'pipeline' && (
          <CandidateLeaderboard
            candidates={candidates}
            matches={matches}
            activeJd={activeJd}
            onSelectCandidate={setSelectedCandidateId}
            onStartInterview={startInterview}
            onViewAudit={viewAudit}
            onViewDossier={viewDossier}
            onToggleCompare={handleToggleCompare}
            selectedCompareIds={selectedCompareIds}
            onUploadResume={handleUploadResume}
          />
        )}

        {activeTab === 'audit' && (
          <EvidenceAuditViewer
            candidates={candidates}
            matches={matches}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
          />
        )}

        {activeTab === 'interview' && (
          <LiveInterviewSimulator
            candidates={candidates}
            matches={matches}
            activeJd={activeJd}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            onFetchQuestions={handleFetchQuestions}
            onEvaluateAnswer={handleEvaluateAnswer}
            onViewDossier={viewDossier}
          />
        )}

        {activeTab === 'search' && (
          <NaturalLanguageSearch
            candidates={candidates}
            matches={matches}
            onQueryPool={handleQueryPool}
            onSelectCandidate={setSelectedCandidateId}
            onStartInterview={startInterview}
            onViewAudit={viewAudit}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonMatrix
            candidates={candidates}
            matches={matches}
            activeJd={activeJd}
            selectedCompareIds={selectedCompareIds}
            onToggleCompare={handleToggleCompare}
            onStartInterview={startInterview}
            onViewAudit={viewAudit}
          />
        )}

        {activeTab === 'dossier' && (
          <EvaluationReport
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            onSelectCandidate={setSelectedCandidateId}
            onFetchDossier={handleFetchDossier}
          />
        )}

        {activeTab === 'job' && (
          <JobWorkspace
            jds={jds}
            activeJd={activeJd}
            onSelectJd={handleSelectJd}
            onParseNewJd={handleParseNewJd}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HireFlow — AI Candidate Screening & Interview Intelligence Agent</span>
          <span>Dual Multi-Agent & Grounded Citation Architecture • Built for AI Agent Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
