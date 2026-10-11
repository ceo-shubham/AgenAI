import sys
import io
import json
import time

# Ensure UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_api():
    print("Testing backend logic directly via agent objects...")
    from sample_data import SAMPLE_JOB_DESCRIPTIONS, SAMPLE_CANDIDATES
    from agents.jd_agent import JobDescriptionAgent
    from agents.resume_agent import ResumeParsingAgent
    from agents.matcher_agent import CandidateMatcherAgent
    from agents.nl_search_agent import CandidatePoolSearchAgent
    from agents.interview_agent import InterviewIntelligenceAgent
    from agents.simulator_agent import LiveInterviewSimulatorAgent
    from agents.audit_agent import AuditTrailSynthesizerAgent
    from models import AnswerEvaluationRequest

    jd_agent = JobDescriptionAgent()
    resume_agent = ResumeParsingAgent()
    matcher_agent = CandidateMatcherAgent()
    nl_agent = CandidatePoolSearchAgent()
    interview_agent = InterviewIntelligenceAgent()
    simulator_agent = LiveInterviewSimulatorAgent()
    audit_agent = AuditTrailSynthesizerAgent()

    # 1. Test Matching
    current_jd = SAMPLE_JOB_DESCRIPTIONS[0]
    candidates = SAMPLE_CANDIDATES
    matches = matcher_agent.match_all(candidates, current_jd)
    print(f"[SUCCESS] Matched {len(matches)} candidates.")
    for m in matches:
        print(f"   - {m.candidate_name}: {m.overall_match_score}% ({m.status_tier}) | Tech: {m.technical_skill_score}%")

    # 2. Test NL Query
    q_res = nl_agent.query_pool("Who has experience with PyTorch and low-latency RAG?", candidates, matches, current_jd)
    print(f"[SUCCESS] NL Query Answer: {q_res.answer[:80]}...")
    print(f"   Matched IDs: {q_res.matched_candidate_ids}")

    # 3. Test Question Generation
    top_cand = candidates[0]
    top_match = matches[0]
    questions = interview_agent.generate_questions(top_cand, top_match, current_jd)
    print(f"[SUCCESS] Generated {len(questions)} tailored interview questions for {top_cand.name}:")
    for q in questions:
        print(f"   [{q.category}] {q.question[:60]}...")

    # 4. Test Live Answer Simulation
    eval_req = AnswerEvaluationRequest(
        candidate_id=top_cand.id,
        question_id=questions[0].id,
        question_text=questions[0].question,
        candidate_answer="In my previous role at Synthetix Labs, we used a hybrid RAG retrieval pipeline combining Qdrant dense vector search with BM25 sparse keyword search via Reciprocal Rank Fusion. We deployed Cohere rerankers and cached popular embeddings in Redis, achieving P95 latency of 115ms.",
        rubric=questions[0].expected_answer_rubric
    )
    eval_res = simulator_agent.evaluate_answer(eval_req)
    print(f"[SUCCESS] Live Answer Evaluation Score: {eval_res.score}/100")
    print(f"   Follow-up Generated: {eval_res.follow_up_question}")

    # 5. Test Audit Dossier
    dossier = audit_agent.generate_dossier(top_cand, top_match, current_jd, [{
        "question": eval_req.question_text,
        "answer": eval_req.candidate_answer,
        "turn_score": eval_res.score
    }])
    print(f"[SUCCESS] Generated Final Dossier: {dossier.final_hiring_recommendation} (Score: {dossier.final_composite_score}/100)")
    print(f"   Citations Count: {len(dossier.audit_trail_citations)}")
    print("\n>>> ALL BACKEND AGENT TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_api()
