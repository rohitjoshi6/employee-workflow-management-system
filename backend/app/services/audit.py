from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.request import WorkflowRequest
from app.models.user import User


def create_audit_log(
    db: Session,
    *,
    actor: User,
    request: WorkflowRequest,
    action: str,
    details: str | None = None,
) -> AuditLog:
    audit_log = AuditLog(actor_id=actor.id, request_id=request.id, action=action, details=details)
    db.add(audit_log)
    return audit_log
