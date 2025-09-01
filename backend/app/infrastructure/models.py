from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Integer, BigInteger, DateTime, UniqueConstraint, Index, CHAR
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.base import Base


class RiskMobile(Base):
    __tablename__ = "risk_mobile"
    __table_args__ = (
        UniqueConstraint("e164", name="uk_e164"),
        Index("idx_country_national", "country_code", "national_number"),
        Index("idx_risk_level", "risk_level"),
    )

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    country_code: Mapped[str] = mapped_column(String(8), nullable=False)
    national_number: Mapped[str] = mapped_column(String(32), nullable=False)
    e164: Mapped[str] = mapped_column(String(32), nullable=False)

    risk_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source: Mapped[str | None] = mapped_column(String(64), nullable=True)
    report_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_reported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)

    is_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gmt_create: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    gmt_modified: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class RiskEmail(Base):
    __tablename__ = "risk_email"
    __table_args__ = (
        UniqueConstraint("address", name="uk_address"),
        Index("idx_domain", "domain"),
        Index("idx_risk_level", "risk_level"),
    )

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    local_part: Mapped[str] = mapped_column(String(128), nullable=False)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(320), nullable=False)

    risk_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mx_valid: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    disposable: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source: Mapped[str | None] = mapped_column(String(64), nullable=True)
    report_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_reported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)

    is_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gmt_create: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    gmt_modified: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class RiskUrl(Base):
    __tablename__ = "risk_url"
    __table_args__ = (
        UniqueConstraint("url_sha256", name="uk_url_sha256"),
        Index("idx_host", "host"),
        Index("idx_registrable_domain", "registrable_domain"),
        Index("idx_risk_level", "risk_level"),
    )

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    scheme: Mapped[str] = mapped_column(String(16), nullable=False)
    host: Mapped[str] = mapped_column(String(255), nullable=False)
    registrable_domain: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    url_sha256: Mapped[str] = mapped_column(CHAR(64), nullable=False)

    risk_level: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    phishing_flag: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    source: Mapped[str | None] = mapped_column(String(64), nullable=True)
    report_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_reported_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(512), nullable=True)

    is_deleted: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gmt_create: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    gmt_modified: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
