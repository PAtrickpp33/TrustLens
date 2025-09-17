from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.api.routes_mobile import router as mobile_router
from app.api.routes_email import router as email_router
from app.api.routes_url import router as url_router
from app.api.routes_articles import router as articles_router
# Richard: Added LLM router
from app.api.routes_llm import router as llm_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": 0},
    description=(
        "TrustLens is an AI-enhanced fraud identification tool for checking mobile numbers,\n"
        "email addresses, and URLs for potential scam risk."
    ),
)

logger.info(f"Starting {settings.app_name} v{settings.app_version}")
logger.info(f"Environment: {settings.app_env}")
logger.info(f"Debug mode: {settings.app_debug}")

# CORS (temporary): allow all origins, methods, and headers for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name, "version": settings.app_version}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.app_name}", "version": settings.app_version, "docs": "/docs"}

# Routers
try:
    app.include_router(mobile_router, prefix="/api/v1", tags=["mobile"])
    logger.info("Mobile router loaded")
    app.include_router(email_router, prefix="/api/v1", tags=["email"])
    logger.info("Email router loaded")
    app.include_router(url_router, prefix="/api/v1", tags=["url"])
    logger.info("URL router loaded")
    app.include_router(articles_router, prefix="/api/v1", tags=["articles"])
    logger.info("Articles router loaded")
    app.include_router(llm_router, prefix="/api/v1", tags=["llm"])
    logger.info("LLM router loaded")
    logger.info("All routers loaded successfully")
except Exception as e:
    logger.error(f"Error loading routers: {e}")
    raise


# Global error handling to unify response format
@app.exception_handler(ValueError)
async def handle_value_error(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"success": False, "error": str(exc)})


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):
    # Preserve status code but unify body
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": detail})
