import os

# Backend configuration
PORT = int(os.environ.get("PORT", 8000))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

# Feature toggles
USE_REAL_LLM_IF_KEY_EXISTS = bool(GEMINI_API_KEY.strip())
