from fastapi import APIRouter

router = APIRouter(prefix="/lists", tags=["lists"])

@router.get("")
def list_lists():
    return []
