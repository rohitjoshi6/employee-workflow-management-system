from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.request import WorkflowRequest
from app.models.user import User, UserRole
from app.schemas.audit_log import AuditLogRead

router = APIRouter(prefix="/audit-logs", tags=["audit logs"])


@router.get("", response_model=list[AuditLogRead])
def list_audit_logs(
    request_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AuditLog]:
    query = select(AuditLog).options(joinedload(AuditLog.actor)).order_by(AuditLog.timestamp.desc())
    if request_id:
        request = db.get(WorkflowRequest, request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        can_view = (
            current_user.role == UserRole.ADMIN
            or request.submitted_by_id == current_user.id
            or request.assigned_manager_id == current_user.id
        )
        if not can_view:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        query = query.where(AuditLog.request_id == request_id)
    elif current_user.role != UserRole.ADMIN:
        related_request_ids = select(WorkflowRequest.id).where(
            (WorkflowRequest.submitted_by_id == current_user.id)
            | (WorkflowRequest.assigned_manager_id == current_user.id)
        )
        query = query.where(AuditLog.request_id.in_(related_request_ids))
    return list(db.scalars(query))
