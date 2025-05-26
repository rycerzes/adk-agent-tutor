import os
import warnings
from pathlib import Path
import uvicorn

# Suppress Google AI default value warnings
warnings.filterwarnings(
    "ignore",
    message="Default value is not supported in function declaration schema for Google AI",
)
from fastapi import FastAPI, APIRouter  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import RedirectResponse, FileResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from google.adk.cli.fast_api import get_fast_api_app  # noqa: E402
import google.adk.cli.fast_api as fast_api  # noqa: E402

# https://github.com/google/adk-python/issues/51

# Get the agent directory path
AGENT_DIR = Path(__file__).parent / "tutor_agent"

app: FastAPI = get_fast_api_app(
    agent_dir=AGENT_DIR,
    web=False,  # Setting this to True invalidates any additional routes
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# custom router
health_router = APIRouter()


@health_router.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(health_router)

SERVE_WEB_INTERFACE = os.environ.get("SERVE_WEB_INTERFACE")

if SERVE_WEB_INTERFACE:
    BASE_DIR = Path(fast_api.__file__).parent.resolve()
    ANGULAR_DIST_PATH = BASE_DIR / "browser"

    @app.get("/")
    async def redirect_to_dev_ui():
        return RedirectResponse("/dev-ui")

    @app.get("/dev-ui")
    async def dev_ui():
        return FileResponse(BASE_DIR / "browser/index.html")

    app.mount("/", StaticFiles(directory=ANGULAR_DIST_PATH, html=True), name="static")

if __name__ == "__main__":
    # Use the PORT environment variable provided by Cloud Run, defaulting to 8080
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
