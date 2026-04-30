from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import require_roles
from app.database import get_db
from app.models.request import RequestStatus, WorkflowRequest
from app.models.user import User, UserRole
from app.schemas.workflow_request import RejectRequest, WorkflowRequestRead
from app.services.audit import create_audit_log
from app.services.dashboard import invalidate_dashboard_cache

router = APIRouter(prefix="/approvals", tags=["approvals"])


def _request_query():
    return select(WorkflowRequest).options(
        joinedload(WorkflowRequest.submitted_by), joinedload(WorkflowRequest.assigned_manager)
    )


def _assigned_or_admin(user: User, request: WorkflowRequest) -> bool:
    return user.role == UserRole.ADMIN or request.assigned_manager_id == user.id


@router.get("/queue", response_model=list[WorkflowRequestRead])
def approval_queue(
    current_user: User = Depends(require_roles(UserRole.MANAGER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[WorkflowRequest]:
    query = _request_query().where(WorkflowRequest.status == RequestStatus.PENDING)
    if current_user.role == UserRole.MANAGER:
        query = query.where(WorkflowRequest.assigned_manager_id == current_user.id)
    return list(db.scalars(query.order_by(WorkflowRequest.created_at.asc())))


@router.get("/history", response_model=list[WorkflowRequestRead])
def approval_history(
    current_user: User = Depends(require_roles(UserRole.MANAGER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[WorkflowRequest]:
    query = _request_query().where(WorkflowRequest.status.in_([RequestStatus.APPROVED, RequestStatus.REJECTED]))
    if current_user.role == UserRole.MANAGER:
        query = query.where(WorkflowRequest.assigned_manager_id == current_user.id)
    return list(db.scalars(query.order_by(WorkflowRequest.decided_at.desc())))


@router.post("/{request_id}/approve", response_model=WorkflowRequestRead)
def approve_request(
    request_id: int,
    current_user: User = Depends(require_roles(UserRole.MANAGER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = db.get(WorkflowRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if not _assigned_or_admin(current_user, request):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be approved")

    request.status = RequestStatus.APPROVED
    request.decided_at = datetime.now(UTC)
    request.decision_comment = "Approved"
    create_audit_log(db, actor=current_user, request=request, action="request_approved", details="Request approved")
    db.commit()
    invalidate_dashboard_cache()
    return db.scalar(_request_query().where(WorkflowRequest.id == request_id))


@router.post("/{request_id}/reject", response_model=WorkflowRequestRead)
def reject_request(
    request_id: int,
    payload: RejectRequest,
    current_user: User = Depends(require_roles(UserRole.MANAGER, UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = db.get(WorkflowRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if not _assigned_or_admin(current_user, request):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be rejected")

    request.status = RequestStatus.REJECTED
    request.decided_at = datetime.now(UTC)
    request.decision_comment = payload.comment
    create_audit_log(db, actor=current_user, request=request, action="request_rejected", details=payload.comment)
    db.commit()
    invalidate_dashboard_cache()
    return db.scalar(_request_query().where(WorkflowRequest.id == request_id))
