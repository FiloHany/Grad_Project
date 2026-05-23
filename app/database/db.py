"""
Database setup — SQLAlchemy engine + session factory.

Defaults to SQLite (zero-config, works locally and on Railway with ephemeral FS).
Set DATABASE_URL env var to a PostgreSQL URL to use a persistent database on Railway:
  DATABASE_URL=postgresql://user:pass@host:5432/dbname
"""

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

_BASE_DIR    = Path(__file__).resolve().parent.parent.parent
_SQLITE_PATH = _BASE_DIR / "cardiovision.db"

# Railway provides postgres:// URIs; SQLAlchemy needs postgresql://
_raw_url     = os.environ.get("DATABASE_URL", f"sqlite:///{_SQLITE_PATH}")
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1)

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine       = create_engine(DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base         = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables if they don't exist. Call once at startup."""
    # Import models here so Base.metadata knows about them before create_all.
    from app.database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
