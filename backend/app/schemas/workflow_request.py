from datetime import datetime

from pydantic import BaseModel, Field

from app.models.request import RequestPriority, RequestStatus, RequestType
from app.schemas.user import UserRead


class WorkflowRequestBase(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = Field(min_length=10, max_length=4000)
    request_type: RequestType
    priority: RequestPriority
    assigned_manager_id: int | None = None


class WorkflowRequestCreate(WorkflowRequestBase):
    pass


class WorkflowRequestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = Field(default=None, min_length=10, max_length=4000)
    request_type: RequestType | None = None
    priority: RequestPriority | None = None
    assigned_manager_id: int | None = None


class WorkflowRequestRead(BaseModel):
    id: int
    title: str
    description: str
    request_type: RequestType
    priority: RequestPriority
    status: RequestStatus
    submitted_by_id: int
    assigned_manager_id: int | None
    decision_comment: str | None
    decided_at: datetime | None
    created_at: datetime
    updated_at: datetime
    submitted_by: UserRead
    assigned_manager: UserRead | None

    model_config = {"from_attributes": True}


class RejectRequest(BaseModel):
    comment: str = Field(min_length=3, max_length=1000)
