from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
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


@router.post("/bulk-upload")
async def bulk_upload_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk upload contacts from CSV/Excel file"""
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="File must be CSV or Excel format"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse file based on extension
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns
        required_columns = ['email']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_columns}"
            )
        
        # Process contacts
        created_contacts = []
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Create contact data
                contact_data = {
                    'email': row.get('email', '').strip(),
                    'first_name': row.get('first_name', '').strip() if pd.notna(row.get('first_name')) else None,
                    'last_name': row.get('last_name', '').strip() if pd.notna(row.get('last_name')) else None,
                    'phone': row.get('phone', '').strip() if pd.notna(row.get('phone')) else None,
                    'company': row.get('company', '').strip() if pd.notna(row.get('company')) else None,
                    'tags': row.get('tags', '').strip() if pd.notna(row.get('tags')) else None
                }
                
                # Skip if email is empty
                if not contact_data['email']:
                    errors.append(f"Row {index + 2}: Email is required")
                    continue
                
                # Check if contact already exists
                existing_contact = db.query(Contact).filter(Contact.email == contact_data['email']).first()
                if existing_contact:
                    errors.append(f"Row {index + 2}: Contact with email {contact_data['email']} already exists")
                    continue
                
                # Create new contact
                contact = Contact(
                    email=contact_data['email'],
                    first_name=contact_data['first_name'],
                    last_name=contact_data['last_name'],
                    phone=contact_data['phone'],
                    company=contact_data['company'],
                    tags=contact_data['tags'],
                    user_id=current_user.id
                )
                
                db.add(contact)
                created_contacts.append(contact_data)
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
        
        # Commit all changes
        db.commit()
        
        return {
            "message": f"Successfully uploaded {len(created_contacts)} contacts",
            "created_count": len(created_contacts),
            "error_count": len(errors),
            "errors": errors[:10]  # Limit errors to first 10
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Invalid file format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
