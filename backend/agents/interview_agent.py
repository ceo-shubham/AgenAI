import re
import json
import uuid
import requests
from typing import List, Dict, Any
from models import Candidate, JobDescription, CandidateMatchResult, TailoredQuestion
from config import GEMINI_API_KEY, GEMINI_MODEL

class InterviewIntelligenceAgent:
    """Agent that generates role-specific interview questions tailored to candidate gaps and claims."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def generate_questions(
        self,
        candidate: Candidate,
        match: CandidateMatchResult,
        jd: JobDescription
    ) -> List[TailoredQuestion]:
        
        if self.api_key:
            try:
                llm_questions = self._generate_with_gemini(candidate, match, jd)
                if llm_questions:
                    return llm_questions
            except Exception as e:
                print(f"[InterviewAgent] Gemini fallback due to: {e}")

        return self._generate_rule_based(candidate, match, jd)

    def _generate_with_gemini(
        self,
        candidate: Candidate,
        match: CandidateMatchResult,
        jd: JobDescription
    ) -> List[TailoredQuestion]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
        
        prompt = f"""
        You are an elite Technical Hiring Interview Architect.
        Generate 4 deep, highly tailored interview questions for this candidate applying to {jd.title}.
        
        Job Requirements:
        - Mandatory: {', '.join(jd.mandatory_skills)}
        - Preferred: {', '.join(jd.preferred_skills)}
        
        Candidate Profile:
        - Name: {candidate.name}
        - Current Role: {candidate.current_role}
        - Experience: {candidate.total_experience_years} years
        - Top Skills: {', '.join(candidate.top_skills)}
        - Matched Skills: {', '.join(match.matched_skills)}
        - Missing/Gaps: {', '.join(match.missing_skills)}
        - Flagged Claims/Gaps: {', '.join(match.unverified_claims)}

        Output JSON array with 4 items:
        [
            {{
                "category": "Technical Deep Dive" | "Resume Claim Validation" | "Architecture & System Design" | "Behavioral & Leadership",
                "target_gap_or_claim": "The specific skill or claim targeted",
                "question": "The comprehensive interview question",
                "rationale": "Why this question is critical based on the candidate's resume and gaps",
                "expected_answer_rubric": "Key technical concepts and architecture components expected in a top-tier answer",
                "red_flags": ["Red flag 1 (e.g. superficial answer)", "Red flag 2"],
                "difficulty": "Hard" | "Medium"
            }}
        ]
        """
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=14)
        if res.status_code == 200:
            data = res.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            clean_json = re.sub(r'```json\s*|\s*```', '', content).strip()
            items = json.loads(clean_json)
            return [
                TailoredQuestion(
                    id=f"q-{uuid.uuid4().hex[:6]}",
                    category=q.get("category", "Technical Deep Dive"),
                    target_gap_or_claim=q.get("target_gap_or_claim", "Core Skills"),
                    question=q.get("question", ""),
                    rationale=q.get("rationale", ""),
                    expected_answer_rubric=q.get("expected_answer_rubric", ""),
                    red_flags=q.get("red_flags", []),
                    difficulty=q.get("difficulty", "Medium")
                )
                for q in items
            ]
        return None

    def _generate_rule_based(
        self,
        candidate: Candidate,
        match: CandidateMatchResult,
        jd: JobDescription
    ) -> List[TailoredQuestion]:
        questions = []

        # 1. Technical Deep Dive Question
        if "PyTorch" in candidate.top_skills or "RAG" in candidate.top_skills or "AI" in jd.title:
            questions.append(
                TailoredQuestion(
                    id=f"q-{candidate.id}-1",
                    category="Technical Deep Dive",
                    target_gap_or_claim="RAG Pipeline Optimization & Chunking",
                    question=(
                        f"You mentioned architecting high-throughput RAG pipelines in your recent work. "
                        f"How did you address the semantic drift between dense vector search (bi-encoders) and sparse keyword search (BM25)? "
                        f"Specifically, what reranking algorithms and embedding chunking strategies did you deploy to keep P95 latency under 150ms?"
                    ),
                    rationale=f"Validates {candidate.name}'s claimed mastery of low-latency RAG systems against {jd.title} production requirements.",
                    expected_answer_rubric=(
                        "Candidate should articulate: 1) Hybrid search combining Reciprocal Rank Fusion (RRF), "
                        "2) Cross-encoder or Cohere/BGE reranker latency trade-offs, "
                        "3) Semantic sliding-window chunking, and 4) Vector index caching (HNSW/IVF parameters)."
                    ),
                    red_flags=[
                        "Only mentions basic top-k cosine similarity without reranking or hybrid search",
                        "Cannot explain latency impact of cross-encoders vs bi-encoders",
                        "Unclear on embedding dimensionality and memory consumption"
                    ],
                    difficulty="Hard"
                )
            )
        else:
            questions.append(
                TailoredQuestion(
                    id=f"q-{candidate.id}-1",
                    category="Technical Deep Dive",
                    target_gap_or_claim="Core Engineering & API Architecture",
                    question=(
                        f"In your work at {candidate.current_role.split(' at ')[-1] if ' at ' in candidate.current_role else 'your previous company'}, "
                        f"how did you architect high-concurrency API services to prevent database connection exhaustion and handle cascading failures?"
                    ),
                    rationale=f"Evaluates core backend reliability skills for {jd.title}.",
                    expected_answer_rubric="Mentions connection pooling, circuit breakers, asynchronous background task queues, and idempotent retries.",
                    red_flags=["Suggests synchronous unbounded queries", "No mention of caching or backoff"],
                    difficulty="Medium"
                )
            )

        # 2. Resume Claim / Gap Validation Question
        if match.unverified_claims:
            claim_text = match.unverified_claims[0]
            questions.append(
                TailoredQuestion(
                    id=f"q-{candidate.id}-2",
                    category="Resume Claim Validation",
                    target_gap_or_claim="Verification of High-Throughput Metric Claims",
                    question=(
                        f"Your resume highlights: '{claim_text}'. "
                        f"Can you walk us through the exact architecture, concurrency model, caching layers, and database partitioning strategy "
                        f"that enabled this scale? What was the primary bottleneck you hit during load testing and how was it solved?"
                    ),
                    rationale="Critical audit probe to verify whether candidate directly designed the architecture or was a peripheral contributor.",
                    expected_answer_rubric=(
                        "Clear architectural breakdown: CDN caching hit ratio, horizontal worker scaling, distributed locks/Redis, "
                        "and specific database sharding or read-replica topology."
                    ),
                    red_flags=[
                        "Vagueness on actual throughput numbers or server specs",
                        "Cannot explain what broke during peak load testing",
                        "Blames cloud provider rather than architectural design"
                    ],
                    difficulty="Hard"
                )
            )
        elif match.missing_skills:
            missing_skill = match.missing_skills[0]
            questions.append(
                TailoredQuestion(
                    id=f"q-{candidate.id}-2",
                    category="Resume Claim Validation",
                    target_gap_or_claim=f"Gap Assessment: {missing_skill}",
                    question=(
                        f"Our team heavily utilizes {missing_skill}, which is not explicitly detailed on your resume. "
                        f"Have you worked with {missing_skill} or related paradigms in production or personal projects? "
                        f"How would you ramp up and establish best practices in our environment?"
                    ),
                    rationale=f"Assesses candidate's adaptability and foundational overlap with missing mandatory skill ({missing_skill}).",
                    expected_answer_rubric="Demonstrates strong conceptual grasp, references analogous tools, and outlines concrete 30-day learning roadmap.",
                    red_flags=["Defensive about missing skill", "Pretends to know it without giving concrete answers"],
                    difficulty="Medium"
                )
            )
        else:
            questions.append(
                TailoredQuestion(
                    id=f"q-{candidate.id}-2",
                    category="Resume Claim Validation",
                    target_gap_or_claim="Production Deployment & CI/CD",
                    question=(
                        "Walk us through your end-to-end deployment workflow: from git push to production rollout, canary deployments, and automated rollbacks."
                    ),
                    rationale="Confirms production rigor and reliability standards.",
                    expected_answer_rubric="Explains automated test gates, container scanning, canary health checks, and rollback triggers.",
                    red_flags=["Manual SSH deployments to production", "No automated rollback criteria"],
                    difficulty="Medium"
                )
            )

        # 3. System Design & Architecture Question
        questions.append(
            TailoredQuestion(
                id=f"q-{candidate.id}-3",
                category="Architecture & System Design",
                target_gap_or_claim="Multi-Agent Task Orchestration & Fault Tolerance",
                question=(
                    f"Design an enterprise AI Agent system that ingests 50,000 PDF contracts per hour, "
                    f"extracts key obligations with structured JSON validation, and triggers downstream webhooks with human-in-the-loop review. "
                    f"How do you handle agent hallucinations, LLM rate limits, and asynchronous task retries?"
                ),
                rationale="Directly simulates the complex multi-agent architectures expected in modern enterprise AI systems.",
                expected_answer_rubric=(
                    "Proposes message queue (Kafka/RabbitMQ/Celery), distributed worker pool, schema validation with Pydantic/Instructor, "
                    "exponential backoff for rate limits, token-bucket throttling, and confidence-score routing for human review."
                ),
                red_flags=[
                    "Proposes synchronous blocking HTTP calls in loop",
                    "No error handling for LLM timeouts or non-JSON outputs",
                    "No observability / tracing (e.g. OpenTelemetry / LangSmith)"
                ],
                difficulty="Hard"
            )
        )

        # 4. Behavioral & Leadership Question
        questions.append(
            TailoredQuestion(
                id=f"q-{candidate.id}-4",
                category="Behavioral & Leadership",
                target_gap_or_claim="Technical Conflict & Trade-Off Navigation",
                question=(
                    "Describe a time when you and a principal engineer or product lead strongly disagreed on a fundamental architectural decision. "
                    "What was the technical trade-off, how did you evaluate data to resolve the impasse, and what was the outcome?"
                ),
                rationale=f"Evaluates culture alignment with our values ({', '.join(jd.culture_values[:2])}) and maturity in navigating engineering friction.",
                expected_answer_rubric=(
                    "Follows STAR framework: clearly defines the trade-off (e.g. build vs buy, latency vs accuracy), "
                    "shows evidence of benchmarking data/spikes, active listening, and committing to the final team decision."
                ),
                red_flags=[
                    "Describes petty interpersonal conflict without technical substance",
                    "Shows unwillingness to compromise or 'I was right and they were dumb' attitude",
                    "Could not produce benchmark data to defend position"
                ],
                difficulty="Medium"
            )
        )

        return questions
