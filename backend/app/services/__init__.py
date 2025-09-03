from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from app.domain.entities import ArticleEntity
from app.infrastructure.repositories import SqlAlchemyArticleRepository


class ArticleService:
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyArticleRepository(session)

    def list_published(self) -> list[ArticleEntity]:
        return self.repo.list_published()

    def get_by_slug(self, slug: str) -> Optional[ArticleEntity]:
        return self.repo.get_by_slug(slug)

    def upsert(self, *, slug: str, title: str, summary: Optional[str], content_md: str, is_published: int = 1) -> ArticleEntity:
        entity = self.repo.create_or_update(slug=slug, title=title, summary=summary, content_md=content_md, is_published=is_published)
        self.session.commit()
        return entity

