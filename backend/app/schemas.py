from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

# Authentication schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ContactIn(BaseModel):
    email: EmailStr
    attributes: dict = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class ContactOut(ContactIn):
    id: int
    status: str

class SegmentIn(BaseModel):
    name: str
    definition: dict

class EmailTemplateIn(BaseModel):
    name: str
    mjml: str

class CampaignIn(BaseModel):
    name: str
    template_id: int
    segment_id: int
    send_at: Optional[str] = None