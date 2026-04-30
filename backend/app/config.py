from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Employee Workflow Management System"
    database_url: str = "postgresql+psycopg://workflow:workflow@db:5432/workflow"
    redis_url: str = "redis://redis:6379/0"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8
    cors_origins: list[str] = ["http://localhost:5173", "http://frontend:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
