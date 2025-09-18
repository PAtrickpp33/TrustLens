from __future__ import annotations

from typing import Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.normalization import normalize_url
from app.domain.entities import UrlRisk
from app.infrastructure.repositories import SqlAlchemyUrlRiskRepository
from app.services.llm_service import LLMRiskService
from app.infrastructure.llm import get_llm_session
from app.schemas.llm import GenerateResponseInput

INPUT_TYPE = GenerateResponseInput(type="url")

class UrlRiskService:
    RISK_BAND_CONVERSION = {"SAFE": 1, "LOW RISK": 2, "MEDIUM RISK": 3, "UNSAFE": 4}

    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyUrlRiskRepository(session)
        self.llm_svc: LLMRiskService = LLMRiskService(get_llm_session())
        self.client = self.llm_svc.session.client

    def _ml_evaluate(self, url: str):
        score = self.llm_svc.session.scorer.score(url)
        risk_band = self.llm_svc.risk_band(score)
        risk_level = self.RISK_BAND_CONVERSION.get(risk_band.upper(), 1)
        return {"score": score, "risk_band": risk_band, "risk_level": risk_level}

    def check_or_create(self, *, url: str) -> UrlRisk:
        normalized, scheme, host, registrable, sha = normalize_url(url)
        entity = self.repo.get_by_sha256(sha)
        if (entity and entity.risk_level == 0) or entity is None:
            ml_res = self._ml_evaluate(normalized)
            entity = self.repo.create_or_update(
                full_url=normalized,
                url_sha256=sha,
                scheme=scheme,
                host=host,
                registrable_domain=registrable,
                source=None,
                notes=f"ML Evaluation Results: {str(ml_res)}",
                risk_level=ml_res["risk_level"],
                phishing_flag=0,
            )
            self.session.commit()
        return entity
    
    def get(self, *, url: str):
        _, _, _, _, sha = normalize_url(url)
        entity = self.repo.get_by_sha256(sha)
        return entity
    
    def upsert(self, url: str, **kwargs):
        normalized, scheme, host, registrable, sha = normalize_url(url)
        # kwargs should override the default values if provided
        payload = {
            "full_url": normalized,
            "url_sha256": sha,
            "scheme": scheme,
            "host": host,
            "registrable_domain": registrable,
            "source": None,
            "notes": None,
            "risk_level": 0,
            "phishing_flag": 0,
        }
        payload.update(kwargs)
        entity = self.repo.create_or_update(
            full_url=payload["full_url"],
            url_sha256=payload["url_sha256"],
            scheme=payload["scheme"],
            host=payload["host"],
            registrable_domain=payload["registrable_domain"],
            source=payload["source"],
            notes=payload["notes"],
            risk_level=payload["risk_level"] if payload["risk_level"] in [0,1,2,3,4] else 0,
            phishing_flag=max(payload["phishing_flag"], 1 if payload["risk_level"] > 2 else 0)
        )
        self.session.commit()
        return entity

    def report(
        self, 
        *, 
        url: str, 
        source: str = "user_report", 
        notes: Optional[str] = None, 
        risk_level: Optional[int] = None
        ) -> Tuple[UrlRisk, bool]:
        """
        گزارش URL با ایندمپوتنسی روزانه.
        خروجی: (entity, already_reported)
        """
        normalized, scheme, host, registrable, sha = normalize_url(url)
        existing = self.repo.get_by_sha256(sha)

        # اگر قبلاً SAFE شده، ریپورت کاربر نادیده گرفته می‌شود
        if existing and existing.risk_level == 1:
            return existing, False

        # اگر همین امروز قبلاً ریپورت شده
        if existing and existing.last_reported_at:
            today_utc = datetime.now(timezone.utc).date()
            last_date = (
                existing.last_reported_at.replace(tzinfo=timezone.utc).date()
                if existing.last_reported_at.tzinfo is None
                else existing.last_reported_at.astimezone(timezone.utc).date()
            )
            if last_date == today_utc:
                return existing, True
        
        # گزارش جدید امروز → ارزیابی ML و upsert
        # ml_res = self._ml_evaluate(normalized)
        # risk_level = ml_res["risk_level"]
        entity = self.repo.upsert_report(
            full_url=normalized,
            url_sha256=sha,
            scheme=scheme,
            host=host,
            registrable_domain=registrable,
            source=existing.source if existing else source,
            notes=existing.notes if existing else notes, # Keep preexisting notes if available
            risk_level=entity.risk_level if entity else (risk_level if risk_level else 2), # Keep preexisting risk level if available, otherwise use passed risk_level; fallback is 0
            phishing_flag=1 if risk_level > 2 else 0,
        )
        self.session.commit()
        return entity, False

    def set_is_deleted(self, *, url: str, is_deleted: int) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_is_deleted_by_sha(url_sha256=sha, is_deleted=is_deleted)
        if updated:
            self.session.commit()
        return updated

    def set_notes(self, *, url: str, notes: str | None) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_notes_by_sha(url_sha256=sha, notes=notes)
        if updated:
            self.session.commit()
        return updated

    def set_risk_level(self, *, url: str, risk_level: int) -> bool:
        _, _, _, _, sha = normalize_url(url)
        updated = self.repo.set_risk_level_by_sha(url_sha256=sha, risk_level=risk_level)
        if updated:
            self.session.commit()
        return updated

    def batch_import(self, items: list[tuple[str, int | None, int | None, str | None]]) -> dict:
        summary = {"total": 0, "succeeded": 0, "failed": 0, "errors": []}
        for url, risk_level, phishing_flag, notes in items:
            summary["total"] += 1
            try:
                normalized, scheme, host, registrable, sha = normalize_url(url)
                self.repo.create_or_update(
                    full_url=normalized,
                    url_sha256=sha,
                    scheme=scheme,
                    host=host,
                    registrable_domain=registrable,
                    source=None,
                    notes=notes,
                    risk_level=risk_level,
                    phishing_flag=phishing_flag,
                )
                summary["succeeded"] += 1
            except Exception as e:
                summary["failed"] += 1
                if len(summary["errors"]) < 20:
                    summary["errors"].append({"input": url, "error": str(e)})
                continue
        self.session.commit()
        return summary
