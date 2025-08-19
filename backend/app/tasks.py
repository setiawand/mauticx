import os, uuid
from typing import List
from redis import Redis
from rq import Queue
from sqlalchemy.orm import Session
from .models import CampaignRecipient, Contact
from .config import settings

# Use settings with fallback for Redis URL
redis_url = settings.redis_url or "redis://localhost:6379/0"
redis = Redis.from_url(redis_url)
queue = Queue("send", connection=redis)

def snapshot_recipients(db: Session, campaign_id: int, contact_ids: List[int]):
    for cid in contact_ids:
        cr = CampaignRecipient(campaign_id=campaign_id, contact_id=cid, token=str(uuid.uuid4()))
        db.add(cr)
    db.commit()

    for cid in contact_ids:
        queue.enqueue("app.tasks_worker.send_one", campaign_id, cid)
