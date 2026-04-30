from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.database import get_db
from app.models.user import UserRole
from app.schemas.dashboard import DashboardStats
from app.services.dashboard import get_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(
    _: object = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> DashboardStats:
    return get_dashboard_stats(db)
