import re
import json
import requests
from typing import List, Dict, Any
from models import Candidate, JobDescription, CandidateMatchResult, CandidatePoolQueryResponse
from config import GEMINI_API_KEY, GEMINI_MODEL

class CandidatePoolSearchAgent:
    """Agent that handles Natural Language Search & Querying across the candidate pool."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def query_pool(
        self,
        query: str,
        candidates: List[Candidate],
        matches: List[CandidateMatchResult],
        current_jd: JobDescription
    ) -> CandidatePoolQueryResponse:
        
        if self.api_key:
            try:
                llm_res = self._query_with_gemini(query, candidates, matches, current_jd)
                if llm_res:
                    return llm_res
            except Exception as e:
                print(f"[NLSearchAgent] Gemini fallback due to: {e}")

        return self._query_rule_based(query, candidates, matches, current_jd)

    def _query_with_gemini(
        self,
        query: str,
        candidates: List[Candidate],
        matches: List[CandidateMatchResult],
        current_jd: JobDescription
    ) -> CandidatePoolQueryResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
        
        candidates_summary = [
            {
                "id": c.id,
                "name": c.name,
                "role": c.current_role,
                "years_exp": c.total_experience_years,
                "skills": c.top_skills,
                "achievements": c.key_achievements,
                "match_score": next((m.overall_match_score for m in matches if m.candidate_id == c.id), 0),
                "unverified_claims": next((m.unverified_claims for m in matches if m.candidate_id == c.id), [])
            }
            for c in candidates
        ]

        prompt = f"""
        You are HireFlow's Recruitment Intelligence Agent.
        Answer the recruiter's natural language query using the provided candidate pool and current job context.

        Target Job: {current_jd.title} ({current_jd.experience_level})
        Candidate Pool:
        {json.dumps(candidates_summary, indent=2)}

        Recruiter Query: "{query}"

        Return JSON matching this format:
        {{
            "answer": "Clear, concise direct answer to the recruiter with actionable conclusions.",
            "matched_candidate_ids": ["cand-01", ...],
            "key_insights": ["Insight 1", "Insight 2"],
            "suggested_follow_up_queries": ["Suggested Query 1", "Suggested Query 2"]
        }}
        """

        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            clean_json = re.sub(r'```json\s*|\s*```', '', content).strip()
            parsed = json.loads(clean_json)
            return CandidatePoolQueryResponse(
                answer=parsed.get("answer", "Here are the matching candidates from your pool."),
                matched_candidate_ids=parsed.get("matched_candidate_ids", []),
                key_insights=parsed.get("key_insights", []),
                suggested_follow_up_queries=parsed.get("suggested_follow_up_queries", [])
            )
        return None

    def _query_rule_based(
        self,
        query: str,
        candidates: List[Candidate],
        matches: List[CandidateMatchResult],
        current_jd: JobDescription
    ) -> CandidatePoolQueryResponse:
        q_lower = query.lower()
        matched_ids = []
        insights = []

        # Check for specific candidate mention
        named_candidates = [c for c in candidates if c.name.lower() in q_lower or c.name.split()[0].lower() in q_lower]
        
        if named_candidates:
            c = named_candidates[0]
            m = next((match for match in matches if match.candidate_id == c.id), None)
            matched_ids.append(c.id)
            score_text = f"overall fit score of {m.overall_match_score}% ({m.status_tier})" if m else ""
            answer = f"**{c.name}** currently serves as {c.current_role} with {c.total_experience_years} years of total experience. {score_text}. Top skills include: {', '.join(c.top_skills[:5])}."
            if m and m.unverified_claims:
                insights.append(f"⚠️ Flagged unverified claim: {m.unverified_claims[0]}")
            insights.append(f"Education: {c.education}")
            if c.key_achievements:
                insights.append(f"Key Accomplishment: {c.key_achievements[0]}")
            
            follow_ups = [
                f"What tailored interview questions should I ask {c.name}?",
                f"How does {c.name} compare to the rest of the pool?",
                f"Show audit citations for {c.name}"
            ]
            return CandidatePoolQueryResponse(
                answer=answer,
                matched_candidate_ids=matched_ids,
                key_insights=insights,
                suggested_follow_up_queries=follow_ups
            )

        # Check for skill / keyword queries
        if any(term in q_lower for term in ["rag", "llm", "pytorch", "vector", "ai", "model"]):
            matched = [c for c in candidates if any(k in " ".join(c.top_skills).lower() or k in c.raw_text.lower() for k in ["rag", "pytorch", "llm", "vector", "vllm"])]
            matched_ids = [c.id for c in matched]
            answer = f"Found **{len(matched)} candidates** with proven AI / LLM & RAG experience: {', '.join([c.name for c in matched])}. **Alex Rivera** leads the group with direct 2.5M queries/day RAG production metrics."
            insights.append("Alex Rivera: Stanford M.S., 5.5 yrs exp, built enterprise RAG with Qdrant/Pinecone.")
            insights.append("Maya Chen: Fullstack + AI, built AI workflow studio, unverified 10M QPS claim.")
            insights.append("Elena Rostova: MIT Ph.D., strong PyTorch math foundation, needs GenAI/LLM tooling ramp-up.")
            follow_ups = [
                "Show candidates with highest RAG experience",
                "Who has experience with LangGraph multi-agent frameworks?",
                "Which candidates have unverified claims?"
            ]
            return CandidatePoolQueryResponse(
                answer=answer,
                matched_candidate_ids=matched_ids,
                key_insights=insights,
                suggested_follow_up_queries=follow_ups
            )

        # Check for Kubernetes / Infra / Distributed systems
        if any(term in q_lower for term in ["kubernetes", "k8s", "infra", "distributed", "gpu", "scale"]):
            matched = [c for c in candidates if any(k in c.raw_text.lower() for k in ["kubernetes", "k8s", "distributed", "gpu", "rpc"])]
            matched_ids = [c.id for c in matched]
            answer = f"**David Okafor** is the standout distributed systems specialist in the pool with 7 years of infrastructure leadership and 500-node GPU Kubernetes cluster management."
            insights.append("David Okafor: 7 yrs exp, Staff Architect at NexaCloud, Go/Rust/K8s expert.")
            insights.append("Alex Rivera also has Docker and AWS EKS deployment experience.")
            follow_ups = [
                "Can David Okafor handle our Senior AI Engineer role?",
                "What are David Okafor's main skill gaps?",
                "Compare Alex Rivera and David Okafor"
            ]
            return CandidatePoolQueryResponse(
                answer=answer,
                matched_candidate_ids=matched_ids,
                key_insights=insights,
                suggested_follow_up_queries=follow_ups
            )

        # Check for unverified claims or gaps
        if any(term in q_lower for term in ["gap", "unverified", "risk", "flag", "warning", "fake"]):
            flagged = [m for m in matches if m.unverified_claims or m.gap_warnings]
            matched_ids = [m.candidate_id for m in flagged]
            answer = f"Identified **{len(flagged)} candidates** with specific validation gaps or unverified claims that should be investigated during interviews."
            for m in flagged[:3]:
                cand = next(c for c in candidates if c.id == m.candidate_id)
                claim_sample = m.unverified_claims[0] if m.unverified_claims else (m.gap_warnings[0] if m.gap_warnings else "Skill gap")
                insights.append(f"• **{cand.name}**: {claim_sample}")
            follow_ups = [
                "Generate validation questions for Maya Chen's 10M QPS claim",
                "What questions should we ask about Alex Rivera's Kubernetes scaling?",
                "Show all candidate risk scores"
            ]
            return CandidatePoolQueryResponse(
                answer=answer,
                matched_candidate_ids=matched_ids,
                key_insights=insights,
                suggested_follow_up_queries=follow_ups
            )

        # Default fallback match
        top_candidates = sorted(matches, key=lambda x: x.overall_match_score, reverse=True)[:3]
        matched_ids = [m.candidate_id for m in top_candidates]
        answer = f"Based on the **{current_jd.title}** role requirements, the top {len(top_candidates)} candidates ranked by composite fit score are: " + ", ".join([f"**{m.candidate_name}** ({m.overall_match_score}%)" for m in top_candidates]) + "."
        insights.append(f"Top Candidate: {top_candidates[0].candidate_name} with {top_candidates[0].technical_skill_score}% technical match.")
        insights.append(f"Total candidates in active pool: {len(candidates)}.")
        follow_ups = [
            "Who has the highest technical score?",
            "Show candidates with 4+ years of experience",
            "Which candidate is best suited for immediate interview?"
        ]
        return CandidatePoolQueryResponse(
            answer=answer,
            matched_candidate_ids=matched_ids,
            key_insights=insights,
            suggested_follow_up_queries=follow_ups
        )
