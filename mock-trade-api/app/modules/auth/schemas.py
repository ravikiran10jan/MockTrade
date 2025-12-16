from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: str

class UserCreate(UserBase):
    password: str
    roles: List[str]

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserResponse(UserBase):
    id: str
    roles: List[str]
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None