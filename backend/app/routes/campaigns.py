from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Campaign, EmailTemplate, Segment, Contact
from ..schemas import CampaignIn
from ..segments.compiler import compile_segment
from ..tasks import snapshot_recipients

router = APIRouter(prefix="/campaigns", tags=["campaigns"])

@router.post("")
def create_campaign(payload: CampaignIn, db: Session = Depends(get_db)):
    c = Campaign(**payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return {"id": c.id}

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
