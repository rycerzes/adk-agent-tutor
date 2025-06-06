import os
import warnings
from pathlib import Path
import uvicorn

# Suppress Google AI default value warnings
warnings.filterwarnings(
    "ignore",
    message="Default value is not supported in function declaration schema for Google AI",
)
from fastapi import FastAPI, APIRouter, HTTPException, Request  # noqa: E402
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

# Authentication configuration
AUTH_TOKEN = os.environ.get("AUTH_TOKEN")
if not AUTH_TOKEN:
    print(
        "Warning: AUTH_TOKEN environment variable not set. Authentication will be disabled."
    )


# Authentication middleware
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Skip authentication for health endpoint
    if request.url.path == "/health":
        response = await call_next(request)
        return response

    # Skip authentication if AUTH_TOKEN is not configured
    if not AUTH_TOKEN:
        response = await call_next(request)
        return response

    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Check if it's a Bearer token
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
        )

    # Extract and validate token
    token = auth_header.split(" ", 1)[1]
    if token != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    response = await call_next(request)
    return response


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
