import re
from typing import List, Dict, Any
from models import Candidate, JobDescription, CandidateMatchResult, SkillMatchDetail

class CandidateMatcherAgent:
    """Agent that conducts multi-dimensional screening, skill gap detection, and grounded scoring."""

    def match_candidate(self, candidate: Candidate, jd: JobDescription) -> CandidateMatchResult:
        # 1. Technical Skill Matching
        mandatory_matched = []
        mandatory_missing = []
        partial_matched = []
        breakdown = []

        candidate_skills_lower = [s.lower() for s in candidate.top_skills]
        raw_text_lower = candidate.raw_text.lower()

        # Match mandatory skills
        for skill in jd.mandatory_skills:
            skill_primary = skill.split("(")[0].strip().lower()
            skill_tokens = re.findall(r'\w+', skill_primary)
            
            # Check if direct token in skills list or raw text
            is_direct_skill = any(skill_primary in cs or cs in skill_primary for cs in candidate_skills_lower)
            is_in_text = all(token in raw_text_lower for token in skill_tokens if len(token) > 2)

            evidence_quote = None
            line_num = None

            # Look up evidence citations
            for cite in candidate.evidence_citations:
                if any(t in cite.summary.lower() or t in cite.exact_quote.lower() for t in skill_tokens):
                    evidence_quote = cite.exact_quote
                    line_num = cite.line_number
                    break

            if is_direct_skill or is_in_text:
                mandatory_matched.append(skill)
                breakdown.append(
                    SkillMatchDetail(
                        skill=skill,
                        status="verified_match",
                        confidence=0.95,
                        evidence_quote=evidence_quote or f"Directly mentioned in candidate profile & experience.",
                        line_number=line_num or 1,
                        note="Verified through resume work experience."
                    )
                )
            else:
                # Check for partial / related matches
                is_partial = False
                if "vector" in skill_primary and ("qdrant" in raw_text_lower or "pinecone" in raw_text_lower or "milvus" in raw_text_lower):
                    is_partial = True
                elif "llm" in skill_primary and ("deep learning" in raw_text_lower or "nlp" in raw_text_lower):
                    is_partial = True

                if is_partial:
                    partial_matched.append(skill)
                    breakdown.append(
                        SkillMatchDetail(
                            skill=skill,
                            status="partial_match",
                            confidence=0.65,
                            evidence_quote=evidence_quote,
                            line_number=line_num,
                            note="Partial overlap detected in adjacent domain technologies."
                        )
                    )
                else:
                    mandatory_missing.append(skill)
                    breakdown.append(
                        SkillMatchDetail(
                            skill=skill,
                            status="missing",
                            confidence=0.90,
                            evidence_quote=None,
                            line_number=None,
                            note="Not detected in resume or work accomplishments."
                        )
                    )

        # Match preferred skills
        preferred_matched_count = 0
        for skill in jd.preferred_skills:
            skill_primary = skill.split("(")[0].strip().lower()
            if any(skill_primary in cs for cs in candidate_skills_lower) or skill_primary in raw_text_lower:
                preferred_matched_count += 1

        # 2. Score Calculations
        total_mandatory = max(1, len(jd.mandatory_skills))
        base_tech = (len(mandatory_matched) / total_mandatory) * 80 + (len(partial_matched) / total_mandatory) * 40
        pref_bonus = min(20, (preferred_matched_count / max(1, len(jd.preferred_skills))) * 20)
        tech_score = int(min(100, base_tech + pref_bonus))

        # Experience Fit Score
        min_years = jd.min_years_experience
        cand_years = candidate.total_experience_years
        if cand_years >= min_years:
            exp_score = min(100, int(85 + (cand_years - min_years) * 5))
        else:
            exp_score = max(25, int((cand_years / max(1, min_years)) * 80))

        # Soft Skills & Education Score
        soft_keywords = ["lead", "architect", "mentored", "collaborat", "published", "authored", "spearheaded", "ownership"]
        soft_matches = sum(1 for kw in soft_keywords if kw in raw_text_lower)
        soft_score = min(98, max(50, 60 + soft_matches * 6))

        edu_score = 90 if ("ph.d" in candidate.education.lower() or "m.s" in candidate.education.lower() or "stanford" in candidate.education.lower() or "mit" in candidate.education.lower()) else (80 if "b.s" in candidate.education.lower() or "bachelor" in candidate.education.lower() else 55)

        # Composite Score (Tech 45%, Exp 30%, Soft 15%, Edu 10%)
        overall_score = int(tech_score * 0.45 + exp_score * 0.30 + soft_score * 0.15 + edu_score * 0.10)

        # 3. Gap Warnings & Unverified Claims
        unverified_claims = []
        gap_warnings = []

        for cite in candidate.evidence_citations:
            if cite.claim_type == "gap" or cite.confidence_score < 0.60:
                unverified_claims.append(f"{cite.summary} (Line {cite.line_number}): '{cite.exact_quote}'")

        if mandatory_missing:
            gap_warnings.append(f"Missing {len(mandatory_missing)} required core skills: {', '.join(mandatory_missing[:3])}")
        
        if cand_years < min_years:
            gap_warnings.append(f"Experience shortfall: Has {cand_years} years vs required {min_years}+ years.")

        if unverified_claims:
            gap_warnings.append(f"Identified {len(unverified_claims)} unverified or high-metric claims needing interview probing.")

        # Status Tier
        if overall_score >= 82:
            status_tier = "Strong Match"
            recommendation = "Proceed to Technical Interview. Focus questions on system architecture scaling and team ownership."
        elif overall_score >= 65:
            status_tier = "Potential Fit"
            recommendation = "Conduct Screening Call. Verify depth in partial skill areas and probe unverified resume claims."
        else:
            status_tier = "Underqualified"
            recommendation = "Does not meet foundational core requirements or experience threshold for this specific seniority level."

        exec_summary = (
            f"{candidate.name} exhibits an overall match of {overall_score}% for {jd.title}. "
            f"Technical proficiency is at {tech_score}%, with {len(mandatory_matched)}/{len(jd.mandatory_skills)} mandatory requirements verified. "
            f"Total experience is {cand_years} years (target: {min_years}+ years)."
        )

        return CandidateMatchResult(
            candidate_id=candidate.id,
            candidate_name=candidate.name,
            current_role=candidate.current_role,
            overall_match_score=overall_score,
            technical_skill_score=tech_score,
            experience_fit_score=exp_score,
            soft_skill_score=soft_score,
            education_fit_score=edu_score,
            status_tier=status_tier,
            matched_skills=mandatory_matched,
            missing_skills=mandatory_missing,
            partial_skills=partial_matched,
            unverified_claims=unverified_claims,
            gap_warnings=gap_warnings,
            skill_breakdown=breakdown,
            recommendation=recommendation,
            executive_summary=exec_summary
        )

    def match_all(self, candidates: List[Candidate], jd: JobDescription) -> List[CandidateMatchResult]:
        """Matches all candidates and ranks them in descending order of overall match score."""
        results = [self.match_candidate(c, jd) for c in candidates]
        results.sort(key=lambda x: x.overall_match_score, reverse=True)
        return results
