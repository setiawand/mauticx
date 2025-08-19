from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Event
from fastapi.responses import RedirectResponse

router = APIRouter(prefix="/t", tags=["track"])

GIF = (b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;")

@router.get("/o.gif")
def open(sid: int, db: Session = Depends(get_db)):
    ev = Event(email_send_id=sid, type="open", meta={})
    with next(db) as s:
        s.add(ev); s.commit()
    return Response(content=GIF, media_type="image/gif")

@router.get("/r/{token}")
def click(token: str, u: str, db: Session = Depends(get_db)):
    # In real impl, map token -> email_send_id
    ev = Event(email_send_id=0, type="click", meta={"token": token, "url": u})
    with next(db) as s:
        s.add(ev); s.commit()
    return RedirectResponse(u)
