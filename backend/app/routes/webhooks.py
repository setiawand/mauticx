from fastapi import APIRouter

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/provider/{name}")
def provider_webhook(name: str):
    return {"status": "ok", "provider": name}
