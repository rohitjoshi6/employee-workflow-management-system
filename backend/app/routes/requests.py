from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user, require_roles
from app.database import get_db
from app.models.request import RequestPriority, RequestStatus, RequestType, WorkflowRequest
from app.models.user import User, UserRole
from app.schemas.workflow_request import WorkflowRequestCreate, WorkflowRequestRead, WorkflowRequestUpdate
from app.services.audit import create_audit_log
from app.services.dashboard import invalidate_dashboard_cache

router = APIRouter(prefix="/requests", tags=["requests"])


def _request_query():
    return select(WorkflowRequest).options(
        joinedload(WorkflowRequest.submitted_by), joinedload(WorkflowRequest.assigned_manager)
    )


def _can_view(user: User, request: WorkflowRequest) -> bool:
    return (
        user.role == UserRole.ADMIN
        or request.submitted_by_id == user.id
        or request.assigned_manager_id == user.id
    )


def _resolve_manager_id(db: Session, current_user: User, explicit_manager_id: int | None) -> int | None:
    if explicit_manager_id:
        manager = db.get(User, explicit_manager_id)
        if not manager or manager.role != UserRole.MANAGER:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned manager must be a manager")
        return explicit_manager_id
    if current_user.manager_id:
        return current_user.manager_id
    return db.scalar(select(User.id).where(User.role == UserRole.MANAGER).limit(1))


@router.post("", response_model=WorkflowRequestRead, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: WorkflowRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = WorkflowRequest(
        title=payload.title,
        description=payload.description,
        request_type=payload.request_type,
        priority=payload.priority,
        submitted_by_id=current_user.id,
        assigned_manager_id=_resolve_manager_id(db, current_user, payload.assigned_manager_id),
    )
    db.add(request)
    db.flush()
    create_audit_log(db, actor=current_user, request=request, action="request_created", details="Request submitted")
    db.commit()
    invalidate_dashboard_cache()
    return db.scalar(_request_query().where(WorkflowRequest.id == request.id))


@router.get("/my", response_model=list[WorkflowRequestRead])
def my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[WorkflowRequest]:
    return list(
        db.scalars(
            _request_query()
            .where(WorkflowRequest.submitted_by_id == current_user.id)
            .order_by(WorkflowRequest.created_at.desc())
        )
    )


@router.get("", response_model=list[WorkflowRequestRead])
def list_requests(
    status_filter: RequestStatus | None = Query(default=None, alias="status"),
    request_type: RequestType | None = None,
    priority: RequestPriority | None = None,
    employee_id: int | None = None,
    manager_id: int | None = None,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[WorkflowRequest]:
    query = _request_query().order_by(WorkflowRequest.created_at.desc())
    if status_filter:
        query = query.where(WorkflowRequest.status == status_filter)
    if request_type:
        query = query.where(WorkflowRequest.request_type == request_type)
    if priority:
        query = query.where(WorkflowRequest.priority == priority)
    if employee_id:
        query = query.where(WorkflowRequest.submitted_by_id == employee_id)
    if manager_id:
        query = query.where(WorkflowRequest.assigned_manager_id == manager_id)
    return list(db.scalars(query))


@router.get("/{request_id}", response_model=WorkflowRequestRead)
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = db.scalar(_request_query().where(WorkflowRequest.id == request_id))
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if not _can_view(current_user, request):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return request


@router.put("/{request_id}", response_model=WorkflowRequestRead)
def update_request(
    request_id: int,
    payload: WorkflowRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = db.get(WorkflowRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be edited")
    if request.submitted_by_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    changes = payload.model_dump(exclude_unset=True)
    if "assigned_manager_id" in changes:
        changes["assigned_manager_id"] = _resolve_manager_id(db, current_user, changes["assigned_manager_id"])
    for field, value in changes.items():
        setattr(request, field, value)
    create_audit_log(
        db,
        actor=current_user,
        request=request,
        action="request_updated",
        details="Request details updated",
    )
    db.commit()
    invalidate_dashboard_cache()
    return db.scalar(_request_query().where(WorkflowRequest.id == request_id))


@router.post("/{request_id}/cancel", response_model=WorkflowRequestRead)
def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkflowRequest:
    request = db.get(WorkflowRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if request.status != RequestStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be cancelled")
    if request.submitted_by_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    request.status = RequestStatus.CANCELLED
    create_audit_log(db, actor=current_user, request=request, action="request_cancelled", details="Request cancelled")
    db.commit()
    invalidate_dashboard_cache()
    return db.scalar(_request_query().where(WorkflowRequest.id == request_id))
