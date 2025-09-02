from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

from app.api.routes_mobile import router as mobile_router
from app.api.routes_email import router as email_router
from app.api.routes_url import router as url_router
from app.api.routes_articles import router as articles_router

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
if settings.allow_origins_list == ["*"]:
    # Allow any origin even with credentials by using regex instead of wildcard list
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
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
app.include_router(articles_router, prefix="/api/v1", tags=["articles"])


# Global error handling to unify response format
@app.exception_handler(ValueError)
async def handle_value_error(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"success": False, "error": str(exc)})


@app.exception_handler(HTTPException)
async def handle_http_exception(request: Request, exc: HTTPException):
    # Preserve status code but unify body
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": detail})
