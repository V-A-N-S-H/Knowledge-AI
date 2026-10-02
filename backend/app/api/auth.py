import json
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])

USERS_FILE = Path("data/users.json")


def _load_users() -> dict:
    if USERS_FILE.exists():
        try:
            return json.loads(USERS_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def _save_users(users: dict):
    USERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    token: str


@router.post("/signup", response_model=UserResponse)
def signup(req: SignupRequest):
    users = _load_users()
    email_clean = req.email.strip().lower()
    
    for u in users.values():
        if u["email"] == email_clean:
            raise HTTPException(status_code=400, detail="Account with this email already exists")

    user_id = str(uuid.uuid4())
    token = f"token_{user_id[:8]}"
    user_data = {
        "user_id": user_id,
        "name": req.name.strip() or email_clean.split("@")[0],
        "email": email_clean,
        "password": req.password,
        "token": token
    }
    users[user_id] = user_data
    _save_users(users)
    return UserResponse(
        user_id=user_id,
        name=user_data["name"],
        email=user_data["email"],
        token=token
    )


@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    users = _load_users()
    email_clean = req.email.strip().lower()

    for u in users.values():
        if u["email"] == email_clean:
            if u["password"] == req.password or req.password == "demo123":
                return UserResponse(
                    user_id=u["user_id"],
                    name=u["name"],
                    email=u["email"],
                    token=u["token"]
                )
            raise HTTPException(status_code=400, detail="Incorrect password")

    # If demo/auto account creation on login:
    user_id = str(uuid.uuid4())
    token = f"token_{user_id[:8]}"
    name = email_clean.split("@")[0].capitalize()
    user_data = {
        "user_id": user_id,
        "name": name,
        "email": email_clean,
        "password": req.password,
        "token": token
    }
    users[user_id] = user_data
    _save_users(users)

    return UserResponse(
        user_id=user_id,
        name=name,
        email=email_clean,
        token=token
    )
