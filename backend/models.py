from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class JobDescription(BaseModel):
    id: str
    title: str
    department: str
    experience_level: str  # e.g., "Senior (5+ years)", "Mid-level (3+ years)"
    min_years_experience: int = 3
    mandatory_skills: List[str]
    preferred_skills: List[str]
    responsibilities: List[str]
    culture_values: List[str] = []
    raw_text: str

class WorkExperienceItem(BaseModel):
    company: str
    role: str
    duration: str
    years: float
    description: str
    highlight_skills: List[str] = []

class ResumeEvidenceCitation(BaseModel):
    citation_id: str
    claim_type: str  # "skill", "achievement", "leadership", "gap"
    summary: str
    exact_quote: str
    line_number: int
    source_section: str
    confidence_score: float

class Candidate(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    current_role: str
    total_experience_years: float
    education: str
    top_skills: List[str]
    key_achievements: List[str]
    work_history: List[WorkExperienceItem]
    raw_text: str
    evidence_citations: List[ResumeEvidenceCitation] = []

class SkillMatchDetail(BaseModel):
    skill: str
    status: str  # "verified_match", "partial_match", "missing", "unverified_claim"
    confidence: float
    evidence_quote: Optional[str] = None
    line_number: Optional[int] = None
    note: Optional[str] = None

class CandidateMatchResult(BaseModel):
    candidate_id: str
    candidate_name: str
    current_role: str
    overall_match_score: int  # 0 to 100
    technical_skill_score: int  # 0 to 100
    experience_fit_score: int  # 0 to 100
    soft_skill_score: int  # 0 to 100
    education_fit_score: int  # 0 to 100
    status_tier: str  # "Strong Match", "Potential Fit", "Underqualified", "Overqualified"
    matched_skills: List[str]
    missing_skills: List[str]
    partial_skills: List[str]
    unverified_claims: List[str]
    gap_warnings: List[str]
    skill_breakdown: List[SkillMatchDetail]
    recommendation: str
    executive_summary: str

class TailoredQuestion(BaseModel):
    id: str
    category: str  # "Technical Deep Dive", "Resume Claim Validation", "Architecture & System Design", "Behavioral & Leadership"
    target_gap_or_claim: str
    question: str
    rationale: str
    expected_answer_rubric: str
    red_flags: List[str]
    difficulty: str = "Medium"

class LiveInterviewMessage(BaseModel):
    id: str
    speaker: str  # "interviewer" or "candidate"
    text: str
    timestamp: str
    turn_score: Optional[int] = None
    feedback: Optional[str] = None
    probing_follow_up: Optional[str] = None

class AnswerEvaluationRequest(BaseModel):
    candidate_id: str
    question_id: str
    question_text: str
    candidate_answer: str
    rubric: str
    conversation_history: List[Dict[str, Any]] = []

class AnswerEvaluationResponse(BaseModel):
    score: int  # 0 to 100
    rubric_score_breakdown: Dict[str, int]
    key_strengths: List[str]
    areas_of_concern: List[str]
    follow_up_question: str
    coaching_tip_for_recruiter: str
    evidence_status_update: str  # "gap_resolved", "gap_confirmed", "partially_clarified"

class CandidateDossier(BaseModel):
    candidate_id: str
    candidate_name: str
    target_role: str
    initial_match_score: int
    interview_performance_score: int
    final_composite_score: int
    final_hiring_recommendation: str  # "Strong Hire", "Hire", "Lean No Hire", "No Hire"
    summary_for_hiring_manager: str
    verified_strengths: List[str]
    confirmed_gaps: List[str]
    unanswered_risks: List[str]
    interview_turn_highlights: List[Dict[str, Any]]
    audit_trail_citations: List[Dict[str, Any]]
    next_steps: List[str]

class CandidatePoolQueryRequest(BaseModel):
    query: str
    job_id: Optional[str] = None
    filter_min_score: Optional[int] = 0

class CandidatePoolQueryResponse(BaseModel):
    answer: str
    matched_candidate_ids: List[str]
    key_insights: List[str]
    suggested_follow_up_queries: List[str]
