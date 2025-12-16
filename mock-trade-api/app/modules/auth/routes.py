from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import jwt
from typing import List
import hashlib
import os

from app.modules.auth.schemas import UserLogin, Token, UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Secret key for JWT - in production, use environment variable
SECRET_KEY = os.getenv("SECRET_KEY", "mocktrade_secret_key_for_development_only")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hardcoded users for demo purposes
# In a real application, this would be stored in a database
USERS_DB = {
    "admin": {
        "id": "user1",
        "username": "admin",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "name": "Administrator",
        "roles": ["ADMIN"]
    },
    "viewer": {
        "id": "user2",
        "username": "viewer",
        "password_hash": hashlib.sha256("viewer123".encode()).hexdigest(),
        "name": "Viewer User",
        "roles": ["VIEWER"]
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def authenticate_user(username: str, password: str, role: str):
    user = USERS_DB.get(username)
    if not user:
        return False
    if not verify_password(password, user["password_hash"]):
        return False
    if role not in user["roles"]:
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
async def login_for_access_token(user_data: UserLogin):
    user = authenticate_user(user_data.username, user_data.password, user_data.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, password, or role",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user_data.role},
        expires_delta=access_token_expires
    )
    
    user_response = UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        roles=user["roles"],
        created_at=datetime.utcnow()
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )

@router.post("/logout")
async def logout():
    # In a real application, you would invalidate the token here
    # For this demo, we'll just return a success message
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(token: str):
    # In a real application, you would decode the token and return user info
    # For this demo, we'll just return a placeholder
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
        user = USERS_DB.get(username)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        return UserResponse(
            id=user["id"],
            username=user["username"],
            name=user["name"],
            roles=user["roles"],
            created_at=datetime.utcnow()
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")