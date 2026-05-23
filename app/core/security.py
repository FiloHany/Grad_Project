"""
Security utilities: JWT creation/decoding + bcrypt password hashing.

Uses bcrypt directly (passlib 1.7.4 is incompatible with bcrypt >= 4.x).
JWT_SECRET should be set via environment variable in production.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import JWTError, jwt

SECRET_KEY  = os.environ.get("JWT_SECRET", "cv-dev-secret-CHANGE-IN-PRODUCTION-abc123xyz")
ALGORITHM   = "HS256"
TOKEN_HOURS = int(os.environ.get("JWT_HOURS", "24"))


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(doctor_uuid: str) -> str:
    expire  = datetime.utcnow() + timedelta(hours=TOKEN_HOURS)
    payload = {"sub": doctor_uuid, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Returns doctor UUID from a valid token, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
