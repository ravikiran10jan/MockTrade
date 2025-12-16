from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime
import os

from app.modules.auth.schemas import TokenData

# Secret key for JWT - should match the one in routes.py
SECRET_KEY = os.getenv("SECRET_KEY", "mocktrade_secret_key_for_development_only")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Hardcoded users for demo purposes (should match routes.py)
USERS_DB = {
    "admin": {
        "id": "user1",
        "username": "admin",
        "name": "Admin User",
        "roles": ["ADMIN"]
    },
    "trader": {
        "id": "user2",
        "username": "trader",
        "name": "Trader User",
        "roles": ["TRADER"]
    },
    "support": {
        "id": "user3",
        "username": "support",
        "name": "Support User",
        "roles": ["SUPPORT"]
    },
    "fo_user": {
        "id": "user4",
        "username": "fo_user",
        "name": "FO User",
        "roles": ["FO_USER"]
    },
    "bo_user": {
        "id": "user5",
        "username": "bo_user",
        "name": "BO User",
        "roles": ["BO_USER"]
    }
}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = USERS_DB.get(username)
    if user is None:
        raise credentials_exception
    
    return {"username": username, "role": role, "user_info": user}