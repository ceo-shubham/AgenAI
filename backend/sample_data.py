from models import JobDescription, Candidate, WorkExperienceItem, ResumeEvidenceCitation

SAMPLE_JOB_DESCRIPTIONS = [
    JobDescription(
        id="jd-ai-eng-01",
        title="Senior AI / LLM Systems Engineer",
        department="Core AI & Automation Platform",
        experience_level="Senior (4+ years)",
        min_years_experience=4,
        mandatory_skills=[
            "Python",
            "PyTorch",
            "Large Language Models (LLMs)",
            "RAG (Retrieval-Augmented Generation)",
            "Vector Databases (Pinecone / Qdrant / Milvus)",
            "FastAPI / Microservices",
            "Distributed Inference & Model Optimization"
        ],
        preferred_skills=[
            "Kubernetes",
            "LangGraph / Multi-Agent Frameworks",
            "vLLM / TensorRT-LLM",
            "Docker",
            "CI/CD Pipelines",
            "DSPy / Prompt Optimization"
        ],
        responsibilities=[
            "Architect and deploy low-latency production RAG and multi-agent AI pipelines.",
            "Fine-tune, quantize, and optimize open-weights LLMs for specialized domain tasks.",
            "Scale semantic search indexing across multi-million enterprise document stores.",
            "Collaborate with product and security teams to enforce AI guardrails and auditability."
        ],
        culture_values=[
            "High Ownership",
            "Scientific Rigor & Experimentation",
            "Clean Code & Documentation",
            "Proactive Communication"
        ],
        raw_text="""Senior AI / LLM Systems Engineer
Department: Core AI & Automation Platform
Experience: Senior (4+ years)

About the Role:
We are seeking a Senior AI / LLM Systems Engineer to architect enterprise-grade generative AI applications and scalable agent workflows. You will design retrieval-augmented generation (RAG) architectures, optimize inference latencies, and productionize multi-agent systems.

Key Requirements:
- 4+ years of production software engineering with a strong focus on Python and PyTorch.
- Deep hands-on experience building RAG systems with Vector Databases (Qdrant, Pinecone, or Milvus).
- Production deployment of FastAPI microservices handling high concurrency.
- Experience with model quantization, vLLM, or distributed inference.
- Strong grounding in system design, testing, and AI safety guardrails.

Preferred Qualifications:
- Experience orchestrating multi-agent frameworks (LangGraph, AutoGen, CrewAI).
- Kubernetes, Docker containerization, and automated CI/CD deployment."""
    ),
    JobDescription(
        id="jd-fullstack-02",
        title="Staff Fullstack Platform Architect",
        department="Enterprise Web Engineering",
        experience_level="Staff / Lead (6+ years)",
        min_years_experience=6,
        mandatory_skills=[
            "React / Next.js",
            "TypeScript",
            "Node.js",
            "PostgreSQL",
            "System Architecture & API Design",
            "GraphQL / REST",
            "Micro-frontends & Cloud Infrastructure"
        ],
        preferred_skills=[
            "Python",
            "AWS / GCP",
            "Redis / Caching",
            "Tailwind CSS",
            "WebSockets / Real-time systems",
            "Team Mentorship"
        ],
        responsibilities=[
            "Lead fullstack architecture across client-facing and internal analytics platforms.",
            "Define engineering standards, code review protocols, and modular component systems.",
            "Optimize web application performance (Core Web Vitals) and backend query latencies.",
            "Mentor senior engineers and drive technical roadmaps with product management."
        ],
        culture_values=["Engineering Excellence", "Collaborative Leadership", "User-Centric Design"],
        raw_text="""Staff Fullstack Platform Architect
Department: Enterprise Web Engineering
Experience: 6+ years

We are looking for a Staff Fullstack Platform Architect to spearhead our next-generation enterprise application suite.
Requirements: 6+ years building large-scale React/Next.js and Node.js/TypeScript applications, PostgreSQL schema optimization, microservices, and leading distributed engineering squads."""
    ),
    JobDescription(
        id="jd-ds-03",
        title="Lead Data Scientist & Predictive Analytics",
        department="Data & Intelligence",
        experience_level="Lead (5+ years)",
        min_years_experience=5,
        mandatory_skills=[
            "Python",
            "SQL & Data Warehousing (Snowflake / BigQuery)",
            "Machine Learning (Scikit-Learn, XGBoost)",
            "Statistical Modeling & A/B Testing",
            "Data Pipelines (Airflow / dbt)",
            "Tableau / PowerBI"
        ],
        preferred_skills=[
            "Deep Learning",
            "PySpark / Databricks",
            "MLOps & MLflow",
            "Feature Stores"
        ],
        responsibilities=[
            "Develop predictive revenue, churn, and fraud detection models.",
            "Design statistical experimentation frameworks for rapid feature rollouts.",
            "Partner with executive stakeholders to translate complex ML metrics into business ROI."
        ],
        culture_values=["Data-Driven Mindset", "Business Acumen", "Curiosity"],
        raw_text="""Lead Data Scientist & Predictive Analytics
Department: Data & Intelligence
Experience: 5+ years

We are seeking a Lead Data Scientist to build end-to-end predictive modeling pipelines, architect A/B experimentation platforms, and deliver actionable insights from petabyte-scale data lakes."""
    )
]

SAMPLE_CANDIDATES = [
    Candidate(
        id="cand-01",
        name="Alex Rivera",
        email="alex.rivera.ai@example.com",
        phone="+1 (555) 234-8891",
        location="San Francisco, CA (Open to Remote)",
        current_role="Senior AI Platform Engineer at Synthetix Labs",
        total_experience_years=5.5,
        education="M.S. in Computer Science (AI Track), Stanford University",
        top_skills=["Python", "PyTorch", "Large Language Models (LLMs)", "RAG (Retrieval-Augmented Generation)", "Vector Databases (Pinecone / Qdrant / Milvus)", "FastAPI / Microservices", "LangGraph", "Docker", "vLLM"],
        key_achievements=[
            "Engineered hybrid RAG pipeline processing 2.5M queries/day with sub-120ms P95 latency.",
            "Fine-tuned Llama-3 70B using LoRA and QLoRA, reducing hallucination rate by 38%.",
            "Architected FastAPI microservices with Redis caching and asynchronous job workers.",
            "Published 2 workshop papers on semantic chunking and dense vector retrieval."
        ],
        work_history=[
            WorkExperienceItem(
                company="Synthetix Labs",
                role="Senior AI Platform Engineer",
                duration="2022 - Present (3.5 yrs)",
                years=3.5,
                description="Lead architect for enterprise generative AI assistant. Designed vector retrieval pipelines across 40M enterprise documents. Deployed vLLM inference clusters with custom DSPy prompt routing.",
                highlight_skills=["Python", "PyTorch", "RAG", "FastAPI", "vLLM", "Pinecone", "Qdrant"]
            ),
            WorkExperienceItem(
                company="NeuralStream Inc.",
                role="Machine Learning Engineer",
                duration="2020 - 2022 (2.0 yrs)",
                years=2.0,
                description="Built NLP classification models, automated ingestion pipelines with Docker and Airflow, and deployed PyTorch inference services via FastAPI.",
                highlight_skills=["Python", "PyTorch", "NLP", "FastAPI", "Docker"]
            )
        ],
        raw_text="""Alex Rivera
Email: alex.rivera.ai@example.com | Phone: +1 (555) 234-8891 | Location: San Francisco, CA
Education: M.S. in Computer Science (AI Track), Stanford University (2020)

Professional Summary:
Senior AI Systems Engineer with 5.5 years of experience building high-throughput GenAI systems, multi-agent frameworks, and vector search pipelines.

Experience:
1. Senior AI Platform Engineer | Synthetix Labs (2022 - Present)
- Architected enterprise RAG platform utilizing Qdrant and Pinecone, handling 2.5M daily requests with <120ms response times.
- Optimized multi-agent reasoning chains using LangGraph, coordinating 6 autonomous micro-agents for structured data extraction.
- Quantized and deployed 70B parameter models on AWS GPU nodes using vLLM and TensorRT-LLM, cutting inference costs by 45%.
- Maintained 99.98% uptime across 12 FastAPI microservices.

2. Machine Learning Engineer | NeuralStream Inc. (2020 - 2022)
- Developed deep learning NLP transformers in PyTorch for entity resolution and sentiment scoring.
- Implemented Dockerized deployment pipelines with Prometheus monitoring.

Technical Skills:
- Languages: Python, C++, SQL, Bash
- AI/ML: PyTorch, HuggingFace, LangGraph, DSPy, LoRA/QLoRA, vLLM, TensorRT-LLM
- Data/Vector: Qdrant, Pinecone, PostgreSQL, Redis, Elasticsearch
- Cloud/DevOps: Docker, AWS (EC2/EKS), Git, FastAPI, CI/CD Pipelines""",
        evidence_citations=[
            ResumeEvidenceCitation(
                citation_id="cite-alex-01",
                claim_type="achievement",
                summary="2.5M daily RAG queries with <120ms latency",
                exact_quote="Architected enterprise RAG platform utilizing Qdrant and Pinecone, handling 2.5M daily requests with <120ms response times.",
                line_number=11,
                source_section="Experience: Synthetix Labs",
                confidence_score=0.96
            ),
            ResumeEvidenceCitation(
                citation_id="cite-alex-02",
                claim_type="skill",
                summary="Multi-agent orchestration with LangGraph",
                exact_quote="Optimized multi-agent reasoning chains using LangGraph, coordinating 6 autonomous micro-agents for structured data extraction.",
                line_number=12,
                source_section="Experience: Synthetix Labs",
                confidence_score=0.94
            ),
            ResumeEvidenceCitation(
                citation_id="cite-alex-03",
                claim_type="gap",
                summary="Kubernetes cluster management scale",
                exact_quote="AWS (EC2/EKS), Docker",
                line_number=22,
                source_section="Technical Skills",
                confidence_score=0.72
            )
        ]
    ),
    Candidate(
        id="cand-02",
        name="Maya Chen",
        email="maya.chen.dev@example.com",
        phone="+1 (555) 349-1029",
        location="Seattle, WA",
        current_role="Lead Fullstack & AI Applications Engineer at CloudVenture",
        total_experience_years=4.8,
        education="B.S. in Software Engineering, University of Washington",
        top_skills=["Python", "FastAPI / Microservices", "React / Next.js", "TypeScript", "RAG (Retrieval-Augmented Generation)", "Vector Databases (Pinecone / Qdrant / Milvus)", "PostgreSQL"],
        key_achievements=[
            "Built end-to-end fullstack AI workflow builder with React frontend and FastAPI backend.",
            "Claims to have scaled an AI API to 10M QPS with zero downtime (Validation Needed).",
            "Implemented Milvus vector search with hybrid BM25 lexical search."
        ],
        work_history=[
            WorkExperienceItem(
                company="CloudVenture",
                role="Lead Fullstack & AI Applications Engineer",
                duration="2021 - Present (3.8 yrs)",
                years=3.8,
                description="Engineered interactive AI studio with React, TypeScript, and FastAPI. Integrated OpenAI and Anthropic APIs with Milvus vector search.",
                highlight_skills=["Python", "FastAPI", "React", "TypeScript", "Milvus"]
            ),
            WorkExperienceItem(
                company="Apex Web Solutions",
                role="Fullstack Developer",
                duration="2019 - 2021 (2.0 yrs)",
                years=2.0,
                description="Developed customer analytics portal using React, Node.js, and PostgreSQL.",
                highlight_skills=["React", "Node.js", "PostgreSQL"]
            )
        ],
        raw_text="""Maya Chen
Email: maya.chen.dev@example.com | Seattle, WA
Education: B.S. Software Engineering, Univ. of Washington (2019)

Summary:
Fullstack & AI Engineer with 4.8 years experience. Highly proficient in Python, React, TypeScript, and modern vector databases.

Experience:
1. CloudVenture (2021 - Present) - Lead Fullstack & AI Engineer
- Built real-time generative AI interface using Next.js and FastAPI.
- Connected Milvus vector database for document search and contextual question answering.
- Handled massive distributed scale with 10M QPS on serverless functions.
- Integrated automated testing suites with 92% coverage.

2. Apex Web Solutions (2019 - 2021) - Fullstack Developer
- Built customer dashboards using React and Express.js.

Skills:
Python, FastAPI, TypeScript, React, Next.js, Milvus, PostgreSQL, Docker, Git.""",
        evidence_citations=[
            ResumeEvidenceCitation(
                citation_id="cite-maya-01",
                claim_type="gap",
                summary="Unverified 10M QPS claim on serverless functions",
                exact_quote="Handled massive distributed scale with 10M QPS on serverless functions.",
                line_number=12,
                source_section="Experience: CloudVenture",
                confidence_score=0.48
            ),
            ResumeEvidenceCitation(
                citation_id="cite-maya-02",
                claim_type="skill",
                summary="FastAPI & Fullstack AI UI integration",
                exact_quote="Built real-time generative AI interface using Next.js and FastAPI.",
                line_number=10,
                source_section="Experience: CloudVenture",
                confidence_score=0.92
            )
        ]
    ),
    Candidate(
        id="cand-03",
        name="David Okafor",
        email="david.okafor.infra@example.com",
        phone="+1 (555) 782-9014",
        location="Austin, TX",
        current_role="Staff Distributed Systems Architect at NexaCloud",
        total_experience_years=7.0,
        education="B.S. in Computer Engineering, Georgia Tech",
        top_skills=["Kubernetes", "Go", "Rust", "Distributed Inference & Model Optimization", "Docker", "CI/CD Pipelines", "Python", "FastAPI / Microservices"],
        key_achievements=[
            "Managed 500-node multi-region Kubernetes cluster running high-throughput GPU workloads.",
            "Designed low-latency RPC mesh in Go and Rust with sub-millisecond serialization.",
            "Transitioned team infrastructure to automated GitOps with ArgoCD and Terraform."
        ],
        work_history=[
            WorkExperienceItem(
                company="NexaCloud",
                role="Staff Distributed Systems Architect",
                duration="2021 - Present (4.0 yrs)",
                years=4.0,
                description="Spearheaded distributed infrastructure, GPU scheduling on Kubernetes, and service mesh optimization.",
                highlight_skills=["Kubernetes", "Go", "Rust", "Docker", "GPU Clusters"]
            ),
            WorkExperienceItem(
                company="DataCore Technologies",
                role="Senior Backend Engineer",
                duration="2018 - 2021 (3.0 yrs)",
                years=3.0,
                description="Built high-concurrency microservices in Go and Python, managing PostgreSQL and Redis caches.",
                highlight_skills=["Go", "Python", "PostgreSQL", "Redis"]
            )
        ],
        raw_text="""David Okafor
Austin, TX | david.okafor.infra@example.com
Education: B.S. Computer Engineering, Georgia Tech (2018)

Summary:
Distributed Systems Specialist with 7 years architecting resilient cloud infrastructure, GPU compute orchestration, and high-performance microservices in Go, Rust, and Python.

Experience:
1. Staff Distributed Systems Architect | NexaCloud (2021 - Present)
- Architected automated GPU cluster orchestration for model serving on Kubernetes.
- Engineered low-latency gRPC services with 99.999% availability.
- Mentored 8 infrastructure engineers across 3 distributed time zones.

2. Senior Backend Engineer | DataCore Technologies (2018 - 2021)
- Built scalable event-driven ingestion pipelines in Python and Go processing 80k events/sec.

Skills:
Kubernetes, Docker, Go, Rust, Python, FastAPI, Terraform, AWS, Linux Kernel Tuning.""",
        evidence_citations=[
            ResumeEvidenceCitation(
                citation_id="cite-david-01",
                claim_type="skill",
                summary="500-node GPU orchestration on Kubernetes",
                exact_quote="Architected automated GPU cluster orchestration for model serving on Kubernetes.",
                line_number=10,
                source_section="Experience: NexaCloud",
                confidence_score=0.98
            ),
            ResumeEvidenceCitation(
                citation_id="cite-david-02",
                claim_type="gap",
                summary="Limited direct RAG and Prompt Engineering experience",
                exact_quote="Skills: Kubernetes, Docker, Go, Rust, Python, FastAPI",
                line_number=19,
                source_section="Technical Skills",
                confidence_score=0.65
            )
        ]
    ),
    Candidate(
        id="cand-04",
        name="Elena Rostova",
        email="elena.rostova.ds@example.com",
        phone="+1 (555) 492-3301",
        location="Boston, MA",
        current_role="Senior Data Scientist at BioAnalytics",
        total_experience_years=4.5,
        education="Ph.D. in Computational Biology & Applied Math, MIT",
        top_skills=["Python", "PyTorch", "Statistical Modeling & A/B Testing", "Data Pipelines (Airflow / dbt)", "SQL & Data Warehousing (Snowflake / BigQuery)", "Scikit-Learn, XGBoost"],
        key_achievements=[
            "Developed predictive clinical trial survival model improving prediction accuracy by 27%.",
            "Authored 5 peer-reviewed publications on computational genomics and machine learning.",
            "Constructed automated feature store and Airflow ETL pipelines in Python."
        ],
        work_history=[
            WorkExperienceItem(
                company="BioAnalytics",
                role="Senior Data Scientist",
                duration="2021 - Present (3.5 yrs)",
                years=3.5,
                description="Designed mathematical modeling and deep learning pipelines in PyTorch for biomarker discovery.",
                highlight_skills=["Python", "PyTorch", "Scikit-Learn", "Airflow", "SQL"]
            )
        ],
        raw_text="""Elena Rostova, Ph.D.
Boston, MA | elena.rostova.ds@example.com
Education: Ph.D. Computational Biology & Applied Math, MIT (2021)

Summary:
Data Scientist with 4.5+ years of specialized experience in deep learning, statistical modeling, PyTorch, and mathematical optimization.

Experience:
Senior Data Scientist | BioAnalytics (2021 - Present)
- Formulated neural networks and survival regression models in PyTorch and XGBoost.
- Automated ETL pipelines processing genetic sequencing data with Airflow and Snowflake.
- Collaborated across multidisciplinary science teams.

Skills:
Python, PyTorch, Scikit-Learn, XGBoost, Airflow, Snowflake, SQL, Pandas, NumPy, Statistics.""",
        evidence_citations=[
            ResumeEvidenceCitation(
                citation_id="cite-elena-01",
                claim_type="achievement",
                summary="Ph.D. research and high mathematical rigor",
                exact_quote="Education: Ph.D. Computational Biology & Applied Math, MIT (2021)",
                line_number=3,
                source_section="Education",
                confidence_score=0.99
            ),
            ResumeEvidenceCitation(
                citation_id="cite-elena-02",
                claim_type="gap",
                summary="No enterprise RAG / Vector DB or production LLM experience",
                exact_quote="Skills: Python, PyTorch, Scikit-Learn, XGBoost, Airflow, Snowflake",
                line_number=15,
                source_section="Skills",
                confidence_score=0.45
            )
        ]
    ),
    Candidate(
        id="cand-05",
        name="Marcus Brody",
        email="marcus.brody.jr@example.com",
        phone="+1 (555) 901-4412",
        location="Chicago, IL",
        current_role="Junior Frontend Developer at DigitalCraft",
        total_experience_years=1.5,
        education="B.A. in Communications, University of Illinois",
        top_skills=["JavaScript", "HTML / CSS", "React basics", "Git", "Figma"],
        key_achievements=[
            "Created landing pages for e-commerce clients using React and CSS.",
            "Self-taught Python via tutorials, built a toy chatbot with basic OpenAI API script."
        ],
        work_history=[
            WorkExperienceItem(
                company="DigitalCraft",
                role="Junior Frontend Developer",
                duration="2023 - Present (1.5 yrs)",
                years=1.5,
                description="Maintained responsive UI components and bug fixes.",
                highlight_skills=["JavaScript", "HTML", "CSS", "React"]
            )
        ],
        raw_text="""Marcus Brody
Chicago, IL | marcus.brody.jr@example.com
Education: B.A. Communications, Univ. of Illinois (2023)

Summary:
Junior Web Developer with 1.5 years of experience building web interfaces. Enthusiastic about pivoting to AI and backend engineering.

Experience:
Junior Frontend Developer | DigitalCraft (2023 - Present)
- Built interactive web UI with HTML, CSS, and basic React components.
- Experimented with Python scripts and chatbot tutorials in spare time.

Skills:
JavaScript, React (basic), HTML5, CSS3, Git, Figma, Python (beginner).""",
        evidence_citations=[
            ResumeEvidenceCitation(
                citation_id="cite-marcus-01",
                claim_type="gap",
                summary="Underqualified for Senior role - only 1.5 yrs junior frontend experience",
                exact_quote="Junior Frontend Developer with 1.5 years of experience building web interfaces.",
                line_number=6,
                source_section="Summary",
                confidence_score=0.95
            )
        ]
    )
]
