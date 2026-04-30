from pydantic import BaseModel


class StatusDistribution(BaseModel):
    status: str
    count: int


class DashboardStats(BaseModel):
    total_requests: int
    pending_requests: int
    approved_requests: int
    rejected_requests: int
    average_approval_time_hours: float
    status_distribution: list[StatusDistribution]
