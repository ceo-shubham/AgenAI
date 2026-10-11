import re
import uuid
from typing import List, Dict, Any
from models import Candidate, WorkExperienceItem, ResumeEvidenceCitation
from config import GEMINI_API_KEY, GEMINI_MODEL
import requests
import json

class ResumeParsingAgent:
    """Agent that extracts structured candidate profiles, work history, and line-grounded evidence."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def parse_resume(self, raw_text: str, candidate_name: str = "") -> Candidate:
        """Parses raw resume text into Candidate model with line-grounded citations."""
        if self.api_key:
            try:
                candidate = self._parse_with_gemini(raw_text, candidate_name)
                if candidate:
                    return candidate
            except Exception as e:
                print(f"[ResumeAgent] Gemini extraction fallback due to: {e}")

        return self._parse_rule_based(raw_text, candidate_name)

    def _parse_with_gemini(self, raw_text: str, default_name: str = "") -> Candidate:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
        prompt = f"""
        Extract structured candidate profile from this resume.
        Provide valid JSON matching this schema:
        {{
            "name": "Candidate Name",
            "email": "email@example.com",
            "phone": "+1 ...",
            "location": "City, State",
            "current_role": "Current Title at Company",
            "total_experience_years": 4.5,
            "education": "Degree, Institution (Year)",
            "top_skills": ["Skill 1", "Skill 2"],
            "key_achievements": ["Achievement 1 with metrics", "Achievement 2"],
            "work_history": [
                {{
                    "company": "Company A",
                    "role": "Role Title",
                    "duration": "2021 - Present",
                    "years": 3.0,
                    "description": "Short summary",
                    "highlight_skills": ["Skill 1", "Skill 2"]
                }}
            ],
            "evidence_citations": [
                {{
                    "claim_type": "skill" or "achievement" or "gap",
                    "summary": "Brief summary",
                    "exact_quote": "Verbatim quote from resume text",
                    "line_number": 10,
                    "source_section": "Experience / Education",
                    "confidence_score": 0.95
                }}
            ]
        }}

        Resume Content:
        {raw_text}
        """
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=14)
        if res.status_code == 200:
            data = res.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            clean_json = re.sub(r'```json\s*|\s*```', '', content).strip()
            parsed = json.loads(clean_json)

            citations = [
                ResumeEvidenceCitation(
                    citation_id=f"cite-{uuid.uuid4().hex[:6]}",
                    claim_type=c.get("claim_type", "skill"),
                    summary=c.get("summary", ""),
                    exact_quote=c.get("exact_quote", ""),
                    line_number=int(c.get("line_number", 1)),
                    source_section=c.get("source_section", "Resume"),
                    confidence_score=float(c.get("confidence_score", 0.9))
                )
                for c in parsed.get("evidence_citations", [])
            ]

            work_items = [
                WorkExperienceItem(
                    company=w.get("company", "Tech Co"),
                    role=w.get("role", "Engineer"),
                    duration=w.get("duration", "2022 - Present"),
                    years=float(w.get("years", 2.0)),
                    description=w.get("description", ""),
                    highlight_skills=w.get("highlight_skills", [])
                )
                for w in parsed.get("work_history", [])
            ]

            return Candidate(
                id=f"cand-{uuid.uuid4().hex[:8]}",
                name=parsed.get("name") or default_name or "Candidate",
                email=parsed.get("email", "candidate@example.com"),
                phone=parsed.get("phone", ""),
                location=parsed.get("location", ""),
                current_role=parsed.get("current_role", "Software Engineer"),
                total_experience_years=float(parsed.get("total_experience_years", 3.0)),
                education=parsed.get("education", "B.S. in Computer Science"),
                top_skills=parsed.get("top_skills", []),
                key_achievements=parsed.get("key_achievements", []),
                work_history=work_items,
                raw_text=raw_text,
                evidence_citations=citations
            )
        return None

    def _parse_rule_based(self, raw_text: str, default_name: str = "") -> Candidate:
        lines = [line.strip() for line in raw_text.split("\n")]
        non_empty = [l for l in lines if l]

        # Name extraction
        name = default_name or (non_empty[0] if non_empty else "Applicant")
        if "@" in name:
            name = "Candidate " + uuid.uuid4().hex[:4].upper()

        # Email extraction
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        email = email_match.group(0) if email_match else "candidate@example.com"

        # Phone extraction
        phone_match = re.search(r'(\+?\d{1,2}\s*)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}', raw_text)
        phone = phone_match.group(0) if phone_match else ""

        # Total Experience Years
        years_match = re.search(r'(\d+(\.\d+)?)\+?\s*(years?|yrs?)', raw_text, re.IGNORECASE)
        total_years = float(years_match.group(1)) if years_match else 3.5

        # Detect Common Tech Skills
        tech_keywords = [
            "Python", "PyTorch", "TensorFlow", "FastAPI", "React", "Next.js", "TypeScript",
            "JavaScript", "Node.js", "Go", "Rust", "Kubernetes", "Docker", "AWS", "GCP",
            "PostgreSQL", "SQL", "Redis", "LangChain", "LangGraph", "Large Language Models (LLMs)",
            "RAG (Retrieval-Augmented Generation)", "Vector Databases (Pinecone / Qdrant / Milvus)",
            "Machine Learning", "Deep Learning", "Airflow", "Snowflake", "BigQuery", "GraphQL",
            "Distributed Systems", "vLLM", "TensorRT-LLM", "CI/CD Pipelines", "System Architecture",
            "HTML5", "CSS3", "Git", "Figma", "Scikit-Learn", "XGBoost", "Pandas", "NumPy"
        ]

        found_skills = []
        citations = []
        for kw in tech_keywords:
            for idx, line in enumerate(lines, 1):
                if re.search(rf'\b{re.escape(kw.split()[0])}\b', line, re.IGNORECASE):
                    if kw not in found_skills:
                        found_skills.append(kw)
                        citations.append(
                            ResumeEvidenceCitation(
                                citation_id=f"cite-{uuid.uuid4().hex[:6]}",
                                claim_type="skill",
                                summary=f"Evidence of {kw}",
                                exact_quote=line[:120],
                                line_number=idx,
                                source_section="Resume Text",
                                confidence_score=0.92
                            )
                        )
                    break

        # Check for vague / high-metric claims needing verification
        for idx, line in enumerate(lines, 1):
            if re.search(r'(\d+M\s*QPS|\d+%\s*revenue|\d+x\s*speedup|scaled\s*to\s*millions)', line, re.IGNORECASE):
                citations.append(
                    ResumeEvidenceCitation(
                        citation_id=f"cite-{uuid.uuid4().hex[:6]}",
                        claim_type="gap",
                        summary="High-metric claim requiring technical verification",
                        exact_quote=line[:120],
                        line_number=idx,
                        source_section="Work Experience",
                        confidence_score=0.55
                    )
                )

        # Work history & achievements
        achievements = [l.lstrip("-*• ") for l in non_empty if l.startswith(("-", "*", "•"))][:4]
        if not achievements:
            achievements = ["Demonstrated software engineering accomplishments with production deployments."]

        work_items = [
            WorkExperienceItem(
                company="Current Organization",
                role="Senior Engineer",
                duration=f"Last {total_years} years",
                years=total_years,
                description="Engineered scalable software platforms and deployed core features.",
                highlight_skills=found_skills[:4]
            )
        ]

        return Candidate(
            id=f"cand-{uuid.uuid4().hex[:8]}",
            name=name,
            email=email,
            phone=phone,
            location="United States",
            current_role=f"Engineer ({total_years} yrs exp)",
            total_experience_years=total_years,
            education="B.S. in Computer Science / Related Field",
            top_skills=found_skills if found_skills else ["Python", "Engineering", "Git"],
            key_achievements=achievements,
            work_history=work_items,
            raw_text=raw_text,
            evidence_citations=citations[:8]
        )
