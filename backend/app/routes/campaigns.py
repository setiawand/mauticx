from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Campaign, EmailTemplate, Segment, Contact
from ..schemas import CampaignIn
from ..segments.compiler import compile_segment
from ..tasks import snapshot_recipients
from ..deps import get_current_user
from ..models import User

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.get("")
def list_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get list of campaigns"""
    campaigns = db.query(Campaign).offset(skip).limit(limit).all()
    return {"data": [{
        "id": c.id,
        "name": c.name,
        "template_id": c.template_id,
        "segment_id": c.segment_id,
        "send_at": c.send_at,
        "status": c.status,
        "custom_content": c.custom_content
    } for c in campaigns]}

@router.post("")
def create_campaign(payload: CampaignIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = Campaign(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return {"id": c.id}

@router.get("/{cid}")
def get_campaign(cid: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get campaign details"""
    campaign = db.get(Campaign, cid)
    if not campaign: raise HTTPException(404, "Campaign not found")
    return {
        "id": campaign.id,
        "name": campaign.name,
        "template_id": campaign.template_id,
        "segment_id": campaign.segment_id,
        "send_at": campaign.send_at,
        "status": campaign.status,
        "custom_content": campaign.custom_content
    }

@router.put("/{cid}")
def update_campaign(cid: int, payload: CampaignIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update campaign"""
    campaign = db.get(Campaign, cid)
    if not campaign: raise HTTPException(404, "Campaign not found")
    
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(campaign, field, value)
    
    db.commit()
    db.refresh(campaign)
    return {"message": "Campaign updated successfully"}

@router.post("/{cid}/schedule")
def schedule(cid: int, db: Session = Depends(get_db)):
    campaign = db.get(Campaign, cid)
    if not campaign: raise HTTPException(404)
    seg = db.get(Segment, campaign.segment_id)
    if not seg: raise HTTPException(400, "segment missing")
    sql, params = compile_segment(seg.definition)
    ids = [r[0] for r in db.execute(sql, params)]
    if not ids:
        return {"scheduled": 0}
    snapshot_recipients(db, cid, ids)
    campaign.status = "sending"; db.commit()
    return {"scheduled": len(ids)}
