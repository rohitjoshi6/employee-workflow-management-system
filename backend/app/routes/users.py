from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(
    role: UserRole | None = None,
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
    db: Session = Depends(get_db),
) -> list[User]:
    query = select(User).order_by(User.name)
    if role:
        query = query.where(User.role == role)
    return list(db.scalars(query))


@router.get("/managers", response_model=list[UserRead])
def list_managers(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[User]:
    return list(db.scalars(select(User).where(User.role == UserRole.MANAGER).order_by(User.name)))
