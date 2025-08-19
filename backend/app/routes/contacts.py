from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..deps import get_current_user
from ..models import Contact, User
from ..schemas import ContactIn, ContactOut

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.get("", response_model=List[ContactOut])
def list_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get list of contacts"""
    contacts = db.query(Contact).offset(skip).limit(limit).all()
    return contacts

@router.post("", response_model=ContactOut)
def create_contact(contact_data: ContactIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new contact"""
    # Check if contact already exists
    existing_contact = db.query(Contact).filter(Contact.email == contact_data.email).first()
    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact with this email already exists"
        )
    
    contact = Contact(**contact_data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get a specific contact"""
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.put("/{contact_id}", response_model=ContactOut)
def update_contact(contact_id: int, contact_data: ContactIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a contact"""
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Check if email is being changed and if it conflicts with existing contact
    if contact_data.email != contact.email:
        existing_contact = db.query(Contact).filter(Contact.email == contact_data.email).first()
        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contact with this email already exists"
            )
    
    for field, value in contact_data.model_dump().items():
        setattr(contact, field, value)
    
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a contact"""
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}
