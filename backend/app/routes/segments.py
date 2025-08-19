from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..deps import get_current_user
from ..models import Segment, User
from ..schemas import SegmentIn
from ..segments.compiler import compile_segment

router = APIRouter(prefix="/segments", tags=["segments"])

@router.get("", response_model=List[dict])
def list_segments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get list of segments"""
    segments = db.query(Segment).offset(skip).limit(limit).all()
    return [{
        "id": s.id,
        "name": s.name,
        "definition": s.definition,
        "materialized_at": s.materialized_at
    } for s in segments]

@router.post("", response_model=dict)
def create_segment(segment_data: SegmentIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new segment"""
    # Validate segment definition by trying to compile it
    try:
        compile_segment(segment_data.definition)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid segment definition: {str(e)}"
        )
    
    segment = Segment(**segment_data.model_dump())
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return {
        "id": segment.id,
        "name": segment.name,
        "definition": segment.definition,
        "materialized_at": segment.materialized_at
    }

@router.get("/{segment_id}", response_model=dict)
def get_segment(segment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific segment"""
    segment = db.get(Segment, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    return {
        "id": segment.id,
        "name": segment.name,
        "definition": segment.definition,
        "materialized_at": segment.materialized_at
    }

@router.put("/{segment_id}", response_model=dict)
def update_segment(segment_id: int, segment_data: SegmentIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a segment"""
    segment = db.get(Segment, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    # Validate segment definition by trying to compile it
    try:
        compile_segment(segment_data.definition)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid segment definition: {str(e)}"
        )
    
    for key, value in segment_data.model_dump().items():
        setattr(segment, key, value)
    
    db.commit()
    db.refresh(segment)
    return {
        "id": segment.id,
        "name": segment.name,
        "definition": segment.definition,
        "materialized_at": segment.materialized_at
    }

@router.delete("/{segment_id}")
def delete_segment(segment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a segment"""
    segment = db.get(Segment, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    db.delete(segment)
    db.commit()
    return {"message": "Segment deleted successfully"}

@router.post("/{segment_id}/preview", response_model=dict)
def preview_segment(segment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Preview contacts that match this segment"""
    segment = db.get(Segment, segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    try:
        from sqlalchemy.sql import text
        sql, params = compile_segment(segment.definition)
        result = db.execute(text(sql), params)
        contact_ids = [row[0] for row in result]
        
        # Get actual contact details for preview
        from ..models import Contact
        contacts = db.query(Contact).filter(Contact.id.in_(contact_ids)).limit(10).all() if contact_ids else []
        
        return {
            "total_count": len(contact_ids),
            "preview_contacts": [{
                "id": c.id,
                "email": c.email,
                "attributes": c.attributes,
                "tags": c.tags
            } for c in contacts]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error executing segment: {str(e)}"
        )
