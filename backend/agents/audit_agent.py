from typing import List, Dict, Any
from models import Candidate, JobDescription, CandidateMatchResult, CandidateDossier, LiveInterviewMessage

class AuditTrailSynthesizerAgent:
    """Agent that compiles complete standardized evaluation dossiers with explainable audit trails."""

    def generate_dossier(
        self,
        candidate: Candidate,
        match: CandidateMatchResult,
        jd: JobDescription,
        interview_history: List[Dict[str, Any]] = None
    ) -> CandidateDossier:
        interview_history = interview_history or []

        # Calculate interview performance score from history turns
        evaluated_scores = [
            turn.get("turn_score") for turn in interview_history
            if turn.get("turn_score") is not None
        ]
        
        if evaluated_scores:
            interview_perf_score = int(sum(evaluated_scores) / len(evaluated_scores))
        else:
            # Default baseline from technical score if no live turns recorded
            interview_perf_score = match.technical_skill_score

        # Composite score calculation: 40% initial resume match, 60% interview performance
        composite_score = int(match.overall_match_score * 0.40 + interview_perf_score * 0.60)

        # Recommendation determination
        if composite_score >= 84:
            recommendation = "Strong Hire"
            summary = (
                f"{candidate.name} exceeded expectations across both initial technical screening and live deep-dive evaluation. "
                f"Demonstrated exceptional mastery of {', '.join(match.matched_skills[:3])} with high architectural nuance. "
                f"Recommended for final executive offer."
            )
        elif composite_score >= 70:
            recommendation = "Hire"
            summary = (
                f"{candidate.name} demonstrated solid competencies aligned with {jd.title}. "
                f"Core engineering foundations are strong, with minor coaching required in secondary framework nuances. "
                f"Proceed to offer."
            )
        elif composite_score >= 55:
            recommendation = "Lean No Hire"
            summary = (
                f"{candidate.name} presented promising experience but demonstrated noticeable gaps during live technical probing. "
                f"Consider for an adjacent mid-level opening rather than this senior role."
            )
        else:
            recommendation = "No Hire"
            summary = (
                f"{candidate.name} did not meet the mandatory criteria or technical depth required for {jd.title}."
            )

        verified_strengths = [
            f"Verified mastery in {skill}" for skill in match.matched_skills[:4]
        ]
        if candidate.key_achievements:
            verified_strengths.append(f"Proven impact: {candidate.key_achievements[0]}")

        confirmed_gaps = []
        if match.missing_skills:
            confirmed_gaps.extend([f"Missing mandatory requirement: {s}" for s in match.missing_skills[:2]])
        if match.gap_warnings:
            confirmed_gaps.append(match.gap_warnings[0])

        unanswered_risks = []
        if len(interview_history) < 2:
            unanswered_risks.append("Limited live interview rounds conducted; complete remaining questions to finalize full assessment.")
        if match.unverified_claims and not evaluated_scores:
            unanswered_risks.append("Flagged resume metric claims require final panel verification.")

        # Compile full audit citations
        audit_citations = []
        for cite in candidate.evidence_citations:
            audit_citations.append({
                "citation_id": cite.citation_id,
                "type": cite.claim_type,
                "summary": cite.summary,
                "quote": cite.exact_quote,
                "line_number": cite.line_number,
                "section": cite.source_section,
                "confidence": cite.confidence_score
            })

        next_steps = [
            f"Hiring Committee Review: Schedule 15-min sync to review Dossier Score ({composite_score}/100)",
            "Reference Check: Validate past team leadership & production deployment track record",
            "Offer Compensation Calibration: Benchmark against Senior Engineering band"
        ]

        return CandidateDossier(
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            target_role=jd.title,
            initial_match_score=match.overall_match_score,
            interview_performance_score=interview_perf_score,
            final_composite_score=composite_score,
            final_hiring_recommendation=recommendation,
            summary_for_hiring_manager=summary,
            verified_strengths=verified_strengths,
            confirmed_gaps=confirmed_gaps,
            unanswered_risks=unanswered_risks,
            interview_turn_highlights=interview_history,
            audit_trail_citations=audit_citations,
            next_steps=next_steps
        )
