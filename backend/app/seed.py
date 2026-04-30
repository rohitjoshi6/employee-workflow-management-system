from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.auth.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models.audit_log import AuditLog
from app.models.request import RequestPriority, RequestStatus, RequestType, WorkflowRequest
from app.models.user import User, UserRole

PASSWORD = "Password123!"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == "admin@example.com"))
        if existing:
            print("Seed data already exists.")
            return

        manager = User(
            name="Morgan Manager",
            email="manager@example.com",
            hashed_password=get_password_hash(PASSWORD),
            role=UserRole.MANAGER,
        )
        admin = User(
            name="Avery Admin",
            email="admin@example.com",
            hashed_password=get_password_hash(PASSWORD),
            role=UserRole.ADMIN,
        )
        employee = User(
            name="Elliot Employee",
            email="employee@example.com",
            hashed_password=get_password_hash(PASSWORD),
            role=UserRole.EMPLOYEE,
            manager=manager,
        )
        db.add_all([manager, admin, employee])
        db.flush()

        now = datetime.now(UTC)
        sample_requests = [
            WorkflowRequest(
                title="PTO for family event",
                description="Requesting two days of PTO for a family event next month.",
                request_type=RequestType.PTO,
                priority=RequestPriority.MEDIUM,
                status=RequestStatus.PENDING,
                submitted_by_id=employee.id,
                assigned_manager_id=manager.id,
                created_at=now - timedelta(days=1),
            ),
            WorkflowRequest(
                title="New development laptop",
                description="Current laptop frequently overheats during local Docker builds.",
                request_type=RequestType.EQUIPMENT,
                priority=RequestPriority.HIGH,
                status=RequestStatus.APPROVED,
                submitted_by_id=employee.id,
                assigned_manager_id=manager.id,
                decision_comment="Approved for Q2 equipment refresh.",
                decided_at=now - timedelta(hours=3),
                created_at=now - timedelta(days=2),
            ),
            WorkflowRequest(
                title="Production analytics access",
                description="Need read-only analytics dashboard access for sprint planning metrics.",
                request_type=RequestType.ACCESS,
                priority=RequestPriority.LOW,
                status=RequestStatus.REJECTED,
                submitted_by_id=employee.id,
                assigned_manager_id=manager.id,
                decision_comment="Please complete data access training first.",
                decided_at=now - timedelta(hours=5),
                created_at=now - timedelta(days=3),
            ),
        ]
        db.add_all(sample_requests)
        db.flush()

        db.add_all(
            [
                AuditLog(
                    actor_id=employee.id,
                    request_id=sample_requests[0].id,
                    action="request_created",
                    details="Request submitted",
                ),
                AuditLog(
                    actor_id=employee.id,
                    request_id=sample_requests[1].id,
                    action="request_created",
                    details="Request submitted",
                ),
                AuditLog(
                    actor_id=manager.id,
                    request_id=sample_requests[1].id,
                    action="request_approved",
                    details="Approved for Q2 equipment refresh.",
                ),
                AuditLog(
                    actor_id=employee.id,
                    request_id=sample_requests[2].id,
                    action="request_created",
                    details="Request submitted",
                ),
                AuditLog(
                    actor_id=manager.id,
                    request_id=sample_requests[2].id,
                    action="request_rejected",
                    details="Please complete data access training first.",
                ),
            ]
        )
        db.commit()
        print("Seed data created.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
