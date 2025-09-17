from __future__ import annotations

from typing import Optional
from sqlalchemy.orm import Session

from app.core.normalization import normalize_url
from app.domain.entities import UrlRisk
from app.infrastructure.repositories import SqlAlchemyUrlRiskRepository
from app.services.llm_service import LLMRiskService
from app.infrastructure.llm import llm_session

class UrlRiskService:
    RISK_BAND_CONVERSION = {"SAFE": 1, "LOW RISK": 2, "MEDIUM RISK": 3, "UNSAFE": 4}
    
    def __init__(self, session: Session):
        self.session = session
        self.repo = SqlAlchemyUrlRiskRepository(session)
        self.llm_svc: LLMRiskService = LLMRiskService(llm_session)

    def _ml_evaluate(self, url: str):
        # Soft risk scoring then conversion to discrete levels (0, 1, 2, 3 for Safe-Unsafe)
        score = self.llm_svc.session.scorer.score(url)
        risk_band = self.llm_svc.risk_band(score)
        risk_level = self.RISK_BAND_CONVERSION.get(risk_band.upper(), 1) # Set unknown to low risk (1)
        return {"score": score, "risk_band": risk_band, "risk_level": risk_level}
    
    # Richard: Added ML evaluation logic here
    def check_or_create(self, *, url: str) -> UrlRisk:
        normalized, scheme, host, registrable, sha = normalize_url(url)
        print(normalized)
        entity = self.repo.get_by_sha256(sha)
        # Richard: If the entity in DB but unknown (0) or is not in DB, then evaluate using ML model before upserting
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
                phishing_flag=0)
            self.session.commit()
        return entity

    # Richard: Removed automatic phishing flag and risk level to safeguard against data poisoning
    # Instead, run it through ML model
    def report(self, *, url: str, source: str = "user_report", notes: Optional[str] = None) -> UrlRisk:
        normalized, scheme, host, registrable, sha = normalize_url(url)
        entity = self.repo.get_by_sha256(sha)
        # Richard: This means it's whitelisted or marked safe, then user reports should be ignored
        if entity and entity.risk_level == 1:
            return entity
        # Richard: Otherwise, run it through ML model first to get the risk level
        else:
            ml_res = self._ml_evaluate(normalized)
            risk_level = ml_res["risk_level"]
            entity = self.repo.upsert_report(
                full_url=normalized, 
                url_sha256=sha, 
                scheme=scheme, 
                host=host, 
                registrable_domain=registrable, 
                source=source, 
                notes=notes if notes else f"ML Evaluation Results: {str(ml_res)}", 
                risk_level=risk_level, # Risk level based on discrete classification from probabilistic risk score
                phishing_flag=1 if risk_level > 2 else 0) # Only flag for phishing if totally certain
            self.session.commit()
        return entity

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
        """Batch import URLs.

        items: list of tuples (url, risk_level, phishing_flag, notes)
        returns summary dict
        """
        summary = {"total": 0, "succeeded": 0, "failed": 0, "errors": []}
        for url, risk_level, phishing_flag, notes in items:
            summary["total"] += 1
            try:
                normalized, scheme, host, registrable, sha = normalize_url(url)
                # Richard: Changed to create_or_update; difference: Doesn't automatically increment reports
                self.repo.create_or_update(full_url=normalized, url_sha256=sha, scheme=scheme, host=host, registrable_domain=registrable, source=None, notes=notes, risk_level=risk_level, phishing_flag=phishing_flag)
                summary["succeeded"] += 1
            except Exception as e:
                summary["failed"] += 1
                if len(summary["errors"]) < 20:
                    summary["errors"].append({"input": url, "error": str(e)})
                continue
        self.session.commit()
        return summary