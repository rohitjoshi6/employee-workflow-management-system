from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class AuditLogRead(BaseModel):
    id: int
    actor_id: int
    action: str
    request_id: int
    timestamp: datetime
    details: str | None
    actor: UserRead

    model_config = {"from_attributes": True}
