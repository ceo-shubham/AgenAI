import re
import json
import requests
from typing import Dict, Any, List
from models import AnswerEvaluationRequest, AnswerEvaluationResponse
from config import GEMINI_API_KEY, GEMINI_MODEL

class LiveInterviewSimulatorAgent:
    """Agent that evaluates candidate interview answers in real-time and generates adaptive follow-ups."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def evaluate_answer(self, req: AnswerEvaluationRequest) -> AnswerEvaluationResponse:
        if self.api_key:
            try:
                res = self._evaluate_with_gemini(req)
                if res:
                    return res
            except Exception as e:
                print(f"[SimulatorAgent] Gemini fallback due to: {e}")

        return self._evaluate_rule_based(req)

    def _evaluate_with_gemini(self, req: AnswerEvaluationRequest) -> AnswerEvaluationResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
        
        prompt = f"""
        You are an Expert AI Technical Interview Evaluator.
        Evaluate this candidate's live interview answer against the expected rubric.

        Question: "{req.question_text}"
        Expected Answer Rubric: "{req.rubric}"
        Candidate's Response: "{req.candidate_answer}"

        Evaluate and return valid JSON matching this schema:
        {{
            "score": 85,
            "rubric_score_breakdown": {{
                "technical_accuracy": 88,
                "depth_and_nuance": 82,
                "clarity_and_structure": 90,
                "practical_real_world_evidence": 80
            }},
            "key_strengths": ["Clear explanation of X", "Mentioned trade-off Y"],
            "areas_of_concern": ["Did not address Z", "Hand-waved metric W"],
            "follow_up_question": "Sharp, contextual follow-up question digging deeper into the weak spot",
            "coaching_tip_for_recruiter": "Quick 1-sentence tip for the interviewer on what to listen for next",
            "evidence_status_update": "gap_resolved" | "partially_clarified" | "gap_confirmed"
        }}
        """
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            clean_json = re.sub(r'```json\s*|\s*```', '', content).strip()
            parsed = json.loads(clean_json)
            return AnswerEvaluationResponse(
                score=int(parsed.get("score", 78)),
                rubric_score_breakdown=parsed.get("rubric_score_breakdown", {
                    "technical_accuracy": 80,
                    "depth_and_nuance": 75,
                    "clarity_and_structure": 80,
                    "practical_real_world_evidence": 75
                }),
                key_strengths=parsed.get("key_strengths", ["Solid conceptual grasp"]),
                areas_of_concern=parsed.get("areas_of_concern", ["Could provide more concrete numbers"]),
                follow_up_question=parsed.get("follow_up_question", "How did you monitor this system in production?"),
                coaching_tip_for_recruiter=parsed.get("coaching_tip_for_recruiter", "Listen for specific metric callouts."),
                evidence_status_update=parsed.get("evidence_status_update", "partially_clarified")
            )
        return None

    def _evaluate_rule_based(self, req: AnswerEvaluationRequest) -> AnswerEvaluationResponse:
        ans_lower = req.candidate_answer.lower()
        word_count = len(req.candidate_answer.split())

        # Check keyword density against rubric terms
        rubric_tokens = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-]{4,}\b', req.rubric) if w.lower() not in ["candidate", "should", "explain", "mentions", "clear", "their", "with"]]
        matched_terms = [t for t in rubric_tokens if t in ans_lower]
        coverage_ratio = len(matched_terms) / max(1, len(rubric_tokens))

        # Check for depth markers
        has_metrics = bool(re.search(r'(\d+ms|\d+%|\d+k|\d+m|qps|latency|throughput|p95|p99)', ans_lower))
        has_tradeoffs = any(w in ans_lower for w in ["trade-off", "tradeoff", "however", "whereas", "bottleneck", "downside", "compromise"])
        has_concrete_tech = any(w in ans_lower for w in ["redis", "kafka", "postgres", "fastapi", "docker", "vllm", "hnsw", "rrf", "rerank", "circuit", "celery", "grpc"])

        base_score = 60
        if word_count > 40:
            base_score += 10
        if word_count > 90:
            base_score += 5
        if coverage_ratio > 0.3:
            base_score += 10
        if has_metrics:
            base_score += 7
        if has_tradeoffs:
            base_score += 5
        if has_concrete_tech:
            base_score += 5

        # Cap between 45 and 96
        final_score = min(96, max(45, base_score))

        tech_acc = min(98, max(50, final_score + 2))
        depth_nuance = min(98, max(45, final_score - (0 if has_tradeoffs else 8)))
        comm_clarity = min(98, max(50, 85 if word_count > 35 else 60))
        practical_ev = min(98, max(45, 88 if has_metrics or has_concrete_tech else 62))

        strengths = []
        concerns = []

        if has_concrete_tech:
            strengths.append("Referenced specific concrete tooling and architectural primitives.")
        if has_metrics:
            strengths.append("Grounds explanation with quantitative scale and latency indicators.")
        if has_tradeoffs:
            strengths.append("Demonstrated high engineering maturity by analyzing trade-offs.")
        if not strengths:
            strengths.append("Structured the answer logically with clear problem breakdown.")

        if not has_tradeoffs:
            concerns.append("Did not explicitly discuss architectural trade-offs or alternative options.")
        if not has_metrics:
            concerns.append("Lacks specific throughput/latency benchmarks or scale metrics.")
        if word_count < 30:
            concerns.append("Response was relatively brief; requires deeper technical elaboration.")

        # Adaptive follow-up generator based on what was missed
        if "rag" in req.question_text.lower() or "vector" in req.question_text.lower():
            if not has_tradeoffs:
                follow_up = "That makes sense. If document embeddings grow from 100k to 50 million chunks, how does your vector index memory footprint and search latency scale, and what sharding strategy would you implement?"
            else:
                follow_up = "How did you benchmark the accuracy improvements of that reranking approach against hallucination rates?"
        elif "10m" in req.question_text.lower() or "qps" in req.question_text.lower() or "scale" in req.question_text.lower():
            follow_up = "When handling that peak traffic, what was your cache hit ratio in Redis/CloudFront, and what happened when a cache stampede or cold start occurred?"
        else:
            follow_up = "What was the biggest unexpected production failure you experienced with this design, and what telemetry alerts caught it first?"

        status_update = "gap_resolved" if final_score >= 82 else ("partially_clarified" if final_score >= 65 else "gap_confirmed")

        return AnswerEvaluationResponse(
            score=final_score,
            rubric_score_breakdown={
                "technical_accuracy": tech_acc,
                "depth_and_nuance": depth_nuance,
                "clarity_and_structure": comm_clarity,
                "practical_real_world_evidence": practical_ev
            },
            key_strengths=strengths,
            areas_of_concern=concerns,
            follow_up_question=follow_up,
            coaching_tip_for_recruiter="Probe into how their solution handled edge-case failures under peak concurrent load.",
            evidence_status_update=status_update
        )
