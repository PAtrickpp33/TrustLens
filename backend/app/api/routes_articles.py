from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_session
from sqlalchemy.orm import Session
from app.schemas import ApiResponse
from pydantic import BaseModel, Field
from app.services import ArticleService


router = APIRouter()


class ArticleCreateOrUpdateRequest(BaseModel):
    slug: str = Field(..., min_length=1, max_length=160)
    title: str = Field(..., min_length=1, max_length=200)
    summary: str | None = Field(default=None, max_length=512)
    content_md: str = Field(..., min_length=1)
    is_published: int = Field(default=1, ge=0, le=1)


def get_article_service(session: Session = Depends(get_session)) -> ArticleService:
    return ArticleService(session)


@router.get("/articles", summary="List published articles")
def list_articles(svc: ArticleService = Depends(get_article_service)):
    items = svc.list_published()
    data = [
        {
            "id": it.id,
            "slug": it.slug,
            "title": it.title,
            "summary": it.summary,
            "gmt_create": it.gmt_create.isoformat() if it.gmt_create else None,
        }
        for it in items
    ]
    return ApiResponse(success=True, data={"items": data})


@router.get("/articles/{slug}", summary="Get article by slug")
def get_article(slug: str, svc: ArticleService = Depends(get_article_service)):
    it = svc.get_by_slug(slug)
    if not it:
        raise HTTPException(status_code=404, detail="Article not found")
    return ApiResponse(success=True, data={
        "id": it.id,
        "slug": it.slug,
        "title": it.title,
        "summary": it.summary,
        "content_md": it.content_md,
        "gmt_create": it.gmt_create.isoformat() if it.gmt_create else None,
        "gmt_modified": it.gmt_modified.isoformat() if it.gmt_modified else None,
    })


@router.post("/articles", summary="Create or update an article")
def upsert_article(payload: ArticleCreateOrUpdateRequest, svc: ArticleService = Depends(get_article_service)):
    it = svc.upsert(slug=payload.slug, title=payload.title, summary=payload.summary, content_md=payload.content_md, is_published=payload.is_published)
    return ApiResponse(success=True, data={
        "id": it.id,
        "slug": it.slug,
        "title": it.title,
        "summary": it.summary,
        "content_md": it.content_md,
        "is_published": it.is_published,
    })


