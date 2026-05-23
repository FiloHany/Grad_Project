"""
SQLAlchemy ORM models.

  Doctor     — registered medical professional
  JobRecord  — analysis job linked to a doctor (full state stored as JSON blob)
"""

import uuid as _uuid_mod
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id             = Column(Integer, primary_key=True, index=True)
    uuid           = Column(String(36), unique=True, nullable=False,
                            default=lambda: str(_uuid_mod.uuid4()))
    full_name      = Column(String(255), nullable=False)
    email          = Column(String(255), unique=True, nullable=False, index=True)
    password_hash  = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    specialty      = Column(String(100), nullable=True)
    created_at     = Column(DateTime, server_default=func.now())

    jobs = relationship("JobRecord", back_populates="doctor",
                        cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "uuid":           self.uuid,
            "full_name":      self.full_name,
            "email":          self.email,
            "license_number": self.license_number,
            "specialty":      self.specialty,
            "created_at":     self.created_at.isoformat() if self.created_at else None,
        }


class JobRecord(Base):
    """
    Stores the full job state dict as a JSON blob plus indexed foreign keys
    so we can efficiently list a doctor's jobs and filter by status.
    """
    __tablename__ = "job_records"

    id        = Column(Integer, primary_key=True, index=True)
    job_id    = Column(String(36), unique=True, nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True, index=True)
    status    = Column(String(50), nullable=False, default="queued", index=True)
    data      = Column(JSON, nullable=False)  # full job dict

    doctor = relationship("Doctor", back_populates="jobs")
