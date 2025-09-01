from fastapi import Depends
from sqlalchemy.orm import Session

from app.infrastructure.db import get_session
from app.services.mobile_service import MobileRiskService
from app.services.email_service import EmailRiskService
from app.services.url_service import UrlRiskService


def get_mobile_service(session: Session = Depends(get_session)) -> MobileRiskService:
    return MobileRiskService(session)


def get_email_service(session: Session = Depends(get_session)) -> EmailRiskService:
    return EmailRiskService(session)


def get_url_service(session: Session = Depends(get_session)) -> UrlRiskService:
    return UrlRiskService(session)
