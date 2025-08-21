from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import EmailTemplate
from ..deps import get_current_user
from ..models import User
from pydantic import BaseModel

router = APIRouter(prefix="/templates", tags=["templates"])

class TemplateCreate(BaseModel):
    name: str
    mjml: str

@router.get("")
def list_templates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all email templates"""
    templates = db.query(EmailTemplate).all()
    
    # If no templates exist, create some sample templates
    if not templates:
        sample_templates = [
            {
                "name": "Welcome Email",
                "mjml": "<mjml><mj-body><mj-section><mj-column><mj-text>Welcome to our newsletter!</mj-text></mj-column></mj-section></mj-body></mjml>"
            },
            {
                "name": "Newsletter Template",
                "mjml": "<mjml><mj-body><mj-section><mj-column><mj-text>This is our monthly newsletter.</mj-text></mj-column></mj-section></mj-body></mjml>"
            },
            {
                "name": "Promotional Email",
                "mjml": "<mjml><mj-body><mj-section><mj-column><mj-text>Special offer just for you!</mj-text></mj-column></mj-section></mj-body></mjml>"
            }
        ]
        
        for template_data in sample_templates:
            template = EmailTemplate(
                name=template_data["name"],
                mjml=template_data["mjml"]
            )
            db.add(template)
        
        db.commit()
        templates = db.query(EmailTemplate).all()
    
    return {"data": [{"id": t.id, "name": t.name, "mjml": t.mjml} for t in templates]}

@router.get("/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific template"""
    from fastapi import HTTPException
    template = db.get(EmailTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"id": template.id, "name": template.name, "mjml": template.mjml}

@router.post("")
def create_template(template: TemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new email template"""
    db_template = EmailTemplate(
        name=template.name,
        mjml=template.mjml
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return {"id": db_template.id, "name": db_template.name, "mjml": db_template.mjml}
