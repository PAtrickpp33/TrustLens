from fastapi import Depends
from sqlalchemy.orm import Session

from app.infrastructure.db import get_session
from app.services.mobile_service import MobileRiskService
from app.services.email_service import EmailRiskService
from app.services.url_service import UrlRiskService
from app.services import ArticleService

# Richard: Added LLM session and service
from app.infrastructure.llm import LLMSession, get_llm_session
from app.services.llm_service import LLMRiskService


def get_mobile_service(session: Session = Depends(get_session)) -> MobileRiskService:
    return MobileRiskService(session)


def get_email_service(session: Session = Depends(get_session)) -> EmailRiskService:
    return EmailRiskService(session)


def get_url_service(session: Session = Depends(get_session)) -> UrlRiskService:
    return UrlRiskService(session)


def get_article_service(session: Session = Depends(get_session)) -> ArticleService:
    return ArticleService(session)


def get_llm_service(session: LLMSession = Depends(get_llm_session)) -> LLMRiskService:
    return LLMRiskService(session)
