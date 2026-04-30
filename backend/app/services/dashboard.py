import json
from datetime import UTC

import redis
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.request import RequestStatus, WorkflowRequest
from app.schemas.dashboard import DashboardStats

CACHE_KEY = "dashboard:stats:v1"
CACHE_TTL_SECONDS = 30


def _redis_client() -> redis.Redis | None:
    try:
        client = redis.Redis.from_url(get_settings().redis_url, decode_responses=True)
        client.ping()
        return client
    except redis.RedisError:
        return None


def _build_stats(db: Session) -> DashboardStats:
    counts = dict(
        db.execute(
            select(WorkflowRequest.status, func.count(WorkflowRequest.id)).group_by(WorkflowRequest.status)
        ).all()
    )
    total = sum(counts.values())

    decided = db.scalars(
        select(WorkflowRequest).where(
            WorkflowRequest.status.in_([RequestStatus.APPROVED, RequestStatus.REJECTED]),
            WorkflowRequest.decided_at.is_not(None),
        )
    ).all()
    durations = []
    for item in decided:
        created_at = item.created_at
        decided_at = item.decided_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        if decided_at and decided_at.tzinfo is None:
            decided_at = decided_at.replace(tzinfo=UTC)
        if decided_at:
            durations.append((decided_at - created_at).total_seconds() / 3600)

    average_hours = round(sum(durations) / len(durations), 2) if durations else 0.0
    return DashboardStats(
        total_requests=total,
        pending_requests=counts.get(RequestStatus.PENDING, 0),
        approved_requests=counts.get(RequestStatus.APPROVED, 0),
        rejected_requests=counts.get(RequestStatus.REJECTED, 0),
        average_approval_time_hours=average_hours,
        status_distribution=[{"status": status.value, "count": count} for status, count in counts.items()],
    )


def get_dashboard_stats(db: Session) -> DashboardStats:
    client = _redis_client()
    if client:
        cached = client.get(CACHE_KEY)
        if cached:
            return DashboardStats.model_validate(json.loads(cached))

    stats = _build_stats(db)
    if client:
        client.setex(CACHE_KEY, CACHE_TTL_SECONDS, stats.model_dump_json())
    return stats


def invalidate_dashboard_cache() -> None:
    client = _redis_client()
    if client:
        client.delete(CACHE_KEY)
