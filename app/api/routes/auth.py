"""
Auth routes
  POST /api/auth/register  — create a new doctor account
  POST /api/auth/login     — get a JWT access token
  GET  /api/auth/me        — get the current doctor's profile
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.database.models import Doctor
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router       = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SPECIALTIES = [
    "Cardiology", "Echocardiography", "Cardiac Surgery",
    "Internal Medicine", "Radiology", "General Practice", "Other",
]


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name:      str
    email:          str
    password:       str
    license_number: str
    specialty:      Optional[str] = None


class LoginRequest(BaseModel):
    email:    str
    password: str


# ── Dependency: resolve current doctor from Bearer token ──────────────────────

def get_current_doctor(
    token: str     = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> Doctor:
    doctor_uuid = decode_access_token(token)
    if not doctor_uuid:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    doctor = db.query(Doctor).filter(Doctor.uuid == doctor_uuid).first()
    if not doctor:
        raise HTTPException(status_code=401, detail="Account not found.")
    return doctor


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201, summary="Register a new doctor account")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")
    if db.query(Doctor).filter(Doctor.email == req.email.lower()).first():
        raise HTTPException(status_code=409, detail="Email is already registered.")
    if db.query(Doctor).filter(Doctor.license_number == req.license_number).first():
        raise HTTPException(status_code=409, detail="License number is already registered.")

    doctor = Doctor(
        uuid           = str(uuid.uuid4()),
        full_name      = req.full_name.strip(),
        email          = req.email.lower().strip(),
        password_hash  = hash_password(req.password),
        license_number = req.license_number.strip(),
        specialty      = req.specialty,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return {
        "access_token": create_access_token(doctor.uuid),
        "token_type":   "bearer",
        "doctor":       doctor.to_dict(),
    }


@router.post("/login", summary="Log in and receive a JWT token")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.email == req.email.lower().strip()).first()
    if not doctor or not verify_password(req.password, doctor.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "access_token": create_access_token(doctor.uuid),
        "token_type":   "bearer",
        "doctor":       doctor.to_dict(),
    }


@router.get("/me", summary="Get the current doctor's profile")
def get_me(doctor: Doctor = Depends(get_current_doctor)):
    return doctor.to_dict()
