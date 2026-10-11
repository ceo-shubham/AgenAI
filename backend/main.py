from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import copy

from models import (
    JobDescription, Candidate, CandidateMatchResult, TailoredQuestion,
    AnswerEvaluationRequest, AnswerEvaluationResponse, CandidateDossier,
    CandidatePoolQueryRequest, CandidatePoolQueryResponse
)
from sample_data import SAMPLE_JOB_DESCRIPTIONS, SAMPLE_CANDIDATES
from agents.jd_agent import JobDescriptionAgent
from agents.resume_agent import ResumeParsingAgent
from agents.matcher_agent import CandidateMatcherAgent
from agents.nl_search_agent import CandidatePoolSearchAgent
from agents.interview_agent import InterviewIntelligenceAgent
from agents.simulator_agent import LiveInterviewSimulatorAgent
from agents.audit_agent import AuditTrailSynthesizerAgent
from config import PORT, GEMINI_API_KEY

app = FastAPI(
    title="HireFlow — AI Candidate Screening & Interview Intelligence API",
    description="Multi-agent recruitment intelligence platform for candidate screening, grounded audit trails, and live adaptive interview copilot.",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State for active session
job_descriptions: List[JobDescription] = copy.deepcopy(SAMPLE_JOB_DESCRIPTIONS)
active_jd_id: str = SAMPLE_JOB_DESCRIPTIONS[0].id
candidates_pool: List[Candidate] = copy.deepcopy(SAMPLE_CANDIDATES)

# Agent singletons
jd_agent = JobDescriptionAgent()
resume_agent = ResumeParsingAgent()
matcher_agent = CandidateMatcherAgent()
nl_search_agent = CandidatePoolSearchAgent()
interview_agent = InterviewIntelligenceAgent()
simulator_agent = LiveInterviewSimulatorAgent()
audit_agent = AuditTrailSynthesizerAgent()

# Cache for live interview sessions per candidate
interview_sessions: Dict[str, List[Dict[str, Any]]] = {}

def get_active_jd() -> JobDescription:
    global active_jd_id
    for jd in job_descriptions:
        if jd.id == active_jd_id:
            return jd
    return job_descriptions[0]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HireFlow Agent Engine",
        "gemini_api_configured": bool(GEMINI_API_KEY.strip()),
        "total_jds": len(job_descriptions),
        "total_candidates": len(candidates_pool),
        "active_jd": get_active_jd().title
    }

@app.get("/api/jds", response_model=List[JobDescription])
def list_jds():
    return job_descriptions

@app.get("/api/jds/active", response_model=JobDescription)
def get_current_active_jd():
    return get_active_jd()

@app.post("/api/jds/select/{jd_id}", response_model=JobDescription)
def select_active_jd(jd_id: str):
    global active_jd_id
    for jd in job_descriptions:
        if jd.id == jd_id:
            active_jd_id = jd_id
            return jd
    raise HTTPException(status_code=404, detail="Job description not found")

@app.post("/api/jds/parse", response_model=JobDescription)
def parse_new_jd(payload: Dict[str, str]):
    raw_text = payload.get("raw_text", "")
    custom_title = payload.get("custom_title", "")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text is required")
    
    parsed_jd = jd_agent.parse_job_description(raw_text, custom_title)
    job_descriptions.insert(0, parsed_jd)
    global active_jd_id
    active_jd_id = parsed_jd.id
    return parsed_jd

@app.get("/api/candidates", response_model=List[Candidate])
def list_candidates():
    return candidates_pool

@app.get("/api/candidates/{candidate_id}", response_model=Candidate)
def get_candidate(candidate_id: str):
    for c in candidates_pool:
        if c.id == candidate_id:
            return c
    raise HTTPException(status_code=404, detail="Candidate not found")

@app.post("/api/candidates/upload", response_model=Candidate)
def upload_candidate(payload: Dict[str, str]):
    raw_text = payload.get("raw_text", "")
    candidate_name = payload.get("candidate_name", "")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text is required")
    
    parsed_cand = resume_agent.parse_resume(raw_text, candidate_name)
    candidates_pool.insert(0, parsed_cand)
    return parsed_cand

@app.get("/api/match/all", response_model=List[CandidateMatchResult])
def get_all_matches():
    current_jd = get_active_jd()
    matches = matcher_agent.match_all(candidates_pool, current_jd)
    return matches

@app.get("/api/match/{candidate_id}", response_model=CandidateMatchResult)
def get_candidate_match(candidate_id: str):
    current_jd = get_active_jd()
    cand = next((c for c in candidates_pool if c.id == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return matcher_agent.match_candidate(cand, current_jd)

@app.post("/api/candidates/query", response_model=CandidatePoolQueryResponse)
def query_candidate_pool(req: CandidatePoolQueryRequest):
    current_jd = get_active_jd()
    matches = matcher_agent.match_all(candidates_pool, current_jd)
    res = nl_search_agent.query_pool(req.query, candidates_pool, matches, current_jd)
    return res

@app.get("/api/interview/questions/{candidate_id}", response_model=List[TailoredQuestion])
def get_tailored_interview_questions(candidate_id: str):
    current_jd = get_active_jd()
    cand = next((c for c in candidates_pool if c.id == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    match = matcher_agent.match_candidate(cand, current_jd)
    questions = interview_agent.generate_questions(cand, match, current_jd)
    return questions

@app.post("/api/interview/evaluate-answer", response_model=AnswerEvaluationResponse)
def evaluate_live_answer(req: AnswerEvaluationRequest):
    res = simulator_agent.evaluate_answer(req)
    
    # Record in live interview history
    if req.candidate_id not in interview_sessions:
        interview_sessions[req.candidate_id] = []
    
    interview_sessions[req.candidate_id].append({
        "question": req.question_text,
        "answer": req.candidate_answer,
        "turn_score": res.score,
        "rubric_breakdown": res.rubric_score_breakdown,
        "strengths": res.key_strengths,
        "concerns": res.areas_of_concern,
        "follow_up_generated": res.follow_up_question,
        "status_update": res.evidence_status_update
    })

    return res

@app.get("/api/interview/history/{candidate_id}")
def get_interview_history(candidate_id: str):
    return interview_sessions.get(candidate_id, [])

@app.get("/api/interview/dossier/{candidate_id}", response_model=CandidateDossier)
def get_candidate_dossier(candidate_id: str):
    current_jd = get_active_jd()
    cand = next((c for c in candidates_pool if c.id == candidate_id), None)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    match = matcher_agent.match_candidate(cand, current_jd)
    history = interview_sessions.get(candidate_id, [])
    dossier = audit_agent.generate_dossier(cand, match, current_jd, history)
    return dossier

@app.post("/api/reset")
def reset_to_sample_data():
    global job_descriptions, active_jd_id, candidates_pool, interview_sessions
    job_descriptions = copy.deepcopy(SAMPLE_JOB_DESCRIPTIONS)
    active_jd_id = SAMPLE_JOB_DESCRIPTIONS[0].id
    candidates_pool = copy.deepcopy(SAMPLE_CANDIDATES)
    interview_sessions = {}
    return {"message": "Reset to default sample dataset successfully."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
