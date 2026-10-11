import re
import uuid
import json
import requests
from typing import Dict, Any, List
from models import JobDescription
from config import GEMINI_API_KEY, GEMINI_MODEL

class JobDescriptionAgent:
    """Agent responsible for parsing raw job descriptions into structured requirements."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def parse_job_description(self, raw_text: str, custom_title: str = "") -> JobDescription:
        """Parses raw job text into structured JobDescription."""
        if self.api_key:
            try:
                llm_result = self._parse_with_gemini(raw_text)
                if llm_result:
                    return llm_result
            except Exception as e:
                print(f"[JDAgent] Gemini extraction fallback due to: {e}")

        # Fallback to high-precision rule-based extraction
        return self._parse_rule_based(raw_text, custom_title)

    def _parse_with_gemini(self, raw_text: str) -> JobDescription:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={self.api_key}"
        prompt = f"""
        Extract structured hiring criteria from the following Job Description.
        Respond ONLY with a valid JSON object matching this schema:
        {{
            "title": "Job Title",
            "department": "Engineering / Product / etc.",
            "experience_level": "Senior (5+ years)",
            "min_years_experience": 4,
            "mandatory_skills": ["Skill 1", "Skill 2"],
            "preferred_skills": ["Skill A", "Skill B"],
            "responsibilities": ["Task 1", "Task 2"],
            "culture_values": ["Value 1", "Value 2"]
        }}

        Job Description:
        {raw_text}
        """
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=12)
        if res.status_code == 200:
            data = res.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean markdown json tags
            clean_json = re.sub(r'```json\s*|\s*```', '', content).strip()
            parsed = json.loads(clean_json)
            return JobDescription(
                id=f"jd-{uuid.uuid4().hex[:8]}",
                title=parsed.get("title", "Custom Role"),
                department=parsed.get("department", "Engineering"),
                experience_level=parsed.get("experience_level", "Mid-Senior"),
                min_years_experience=int(parsed.get("min_years_experience", 3)),
                mandatory_skills=parsed.get("mandatory_skills", []),
                preferred_skills=parsed.get("preferred_skills", []),
                responsibilities=parsed.get("responsibilities", []),
                culture_values=parsed.get("culture_values", []),
                raw_text=raw_text
            )
        return None

    def _parse_rule_based(self, raw_text: str, custom_title: str = "") -> JobDescription:
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        title = custom_title or (lines[0] if lines else "Software Engineer")
        if "Title:" in title:
            title = title.split("Title:")[1].strip()

        # Extract years of experience
        years_match = re.search(r'(\d+)\+?\s*years?', raw_text, re.IGNORECASE)
        min_years = int(years_match.group(1)) if years_match else 3

        # Detect Common Tech Skills
        tech_keywords = [
            "Python", "PyTorch", "TensorFlow", "FastAPI", "React", "Next.js", "TypeScript",
            "JavaScript", "Node.js", "Go", "Rust", "Kubernetes", "Docker", "AWS", "GCP",
            "PostgreSQL", "SQL", "Redis", "LangChain", "LangGraph", "Large Language Models (LLMs)",
            "RAG (Retrieval-Augmented Generation)", "Vector Databases (Pinecone / Qdrant / Milvus)",
            "Machine Learning", "Deep Learning", "Airflow", "Snowflake", "BigQuery", "GraphQL",
            "Distributed Systems", "vLLM", "TensorRT-LLM", "CI/CD Pipelines", "System Architecture"
        ]

        found_skills = []
        for kw in tech_keywords:
            if re.search(rf'\b{re.escape(kw.split()[0])}\b', raw_text, re.IGNORECASE):
                if kw not in found_skills:
                    found_skills.append(kw)

        if not found_skills:
            found_skills = ["Python", "System Design", "Cloud Infrastructure", "Problem Solving"]

        mandatory = found_skills[:max(3, len(found_skills) * 3 // 4)]
        preferred = found_skills[len(mandatory):]
        if not preferred:
            preferred = ["Docker", "Kubernetes", "CI/CD"]

        # Extract bullet points as responsibilities
        bullets = [l.lstrip("-*• ") for l in lines if l.startswith(("-", "*", "•", "1.", "2.", "3."))]
        if not bullets:
            bullets = [
                "Architect and build resilient software systems.",
                "Collaborate with cross-functional engineering squads.",
                "Deliver production-grade code with automated tests."
            ]

        exp_level = "Senior (4+ years)" if min_years >= 4 else ("Mid-level (2-4 years)" if min_years >= 2 else "Junior (0-2 years)")

        return JobDescription(
            id=f"jd-{uuid.uuid4().hex[:8]}",
            title=title,
            department="Engineering Platform",
            experience_level=exp_level,
            min_years_experience=min_years,
            mandatory_skills=mandatory,
            preferred_skills=preferred,
            responsibilities=bullets[:6],
            culture_values=["Ownership", "Collaborative Problem Solving", "Code Quality"],
            raw_text=raw_text
        )
