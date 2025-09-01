from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.api.routes_mobile import router as mobile_router
from app.api.routes_email import router as email_router
from app.api.routes_url import router as url_router

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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(mobile_router, prefix="/api/v1", tags=["mobile"])
app.include_router(email_router, prefix="/api/v1", tags=["email"])
app.include_router(url_router, prefix="/api/v1", tags=["url"])
