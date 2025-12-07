"""
ProdStarterHub - FastAPI template
Production-ready `main.py` for a FastAPI service.

Features included:
- App factory pattern (`create_app`) for testability
- Pydantic settings (env/config driven)
- Structured logging via structlog (plugs into standard logging)
- Prometheus metrics endpoint (`/metrics`) via prometheus_client
- Health endpoints: `/health`, `/live`, `/ready`
- OpenAPI metadata and versioning (mounted at `/api/v1`)
- CORS, GZip, and trusted host middleware
- Global exception handler and graceful startup/shutdown
- Dependency placeholders for DB, cache, background tasks
- Optional hooks for OpenTelemetry / Sentry / tracing

Customize the TODO sections to wire your DB, cache, auth and business logic.
"""
from __future__ import annotations

import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, generate_latest
from prometheus_client import REGISTRY as PROM_REGISTRY
from prometheus_client import Gauge
from pydantic import BaseSettings, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

class Settings(BaseSettings):
    SERVICE_NAME: str = Field("prodstarter-fastapi", env="SERVICE_NAME")
    ENVIRONMENT: str = Field("production", env="ENVIRONMENT")
    DEBUG: bool = Field(False, env="DEBUG")

    # CORS - comma separated list
    CORS_ORIGINS: str = Field("", env="CORS_ORIGINS")

    # Metrics
    METRICS_ENABLED: bool = Field(True, env="METRICS_ENABLED")

    # Optional: database DSN, cache, 3rd party keys
    DATABASE_DSN: str | None = Field(None, env="DATABASE_DSN")
    REDIS_DSN: str | None = Field(None, env="REDIS_DSN")

    # OpenTelemetry / Sentry (optional)
    OTEL_ENABLED: bool = Field(False, env="OTEL_ENABLED")
    SENTRY_DSN: str | None = Field(None, env="SENTRY_DSN")

    # Host / port (uvicorn can override)
    HOST: str = Field("0.0.0.0", env="HOST")
    PORT: int = Field(8000, env="PORT")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# ---------------------------------------------------------------------------
# Logging (structlog)
# ---------------------------------------------------------------------------

def configure_logging() -> None:
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    pre_chain = [
        structlog.processors.add_log_level,
        timestamper,
    ]

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
    )

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


logger = structlog.get_logger(__name__)
configure_logging()

# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "http_status"],
)
REQUEST_LATENCY = Gauge("http_request_latency_seconds", "Request latency in seconds", ["endpoint"])
START_TIME = time.time()

# ---------------------------------------------------------------------------
# Dependency placeholders
# ---------------------------------------------------------------------------

class Database:
    """Placeholder async DB client (e.g. asyncpg, databases, SQLAlchemy+asyncio)"""

    def __init__(self, dsn: str | None):
        self.dsn = dsn
        self.connected = False

    async def connect(self) -> None:
        # TODO: wire your real async DB client connect here
        logger.info("database.connecting", dsn=self.dsn)
        self.connected = True

    async def disconnect(self) -> None:
        logger.info("database.disconnecting")
        self.connected = False

    async def is_healthy(self) -> bool:
        # TODO: perform a simple query/ping to validate connectivity
        return self.connected


_db: Database | None = None

async def get_db() -> AsyncGenerator[Database, None]:
    global _db
    if _db is None:
        _db = Database(settings.DATABASE_DSN)
        await _db.connect()
    try:
        yield _db
    finally:
        # lifecycle-managed; do not disconnect per-request
        pass

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    openapi_prefix = "/api"
    app = FastAPI(
        title=settings.SERVICE_NAME,
        description="Production-ready FastAPI template from ProdStarterHub",
        version="1.0.0",
        openapi_url=f"{openapi_prefix}/v1/openapi.json",
        docs_url=f"{openapi_prefix}/v1/docs",
        redoc_url=f"{openapi_prefix}/v1/redoc",
    )

    # Middleware
    if settings.CORS_ORIGINS:
        origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    else:
        origins = ["*"] if settings.DEBUG else []

    if origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.add_middleware(GZipMiddleware, minimum_size=500)

    # Trusted hosts - in production it's recommended to set real hostnames
    if not settings.DEBUG:
        hosts = os.environ.get("TRUSTED_HOSTS", "*")
        host_list = [h.strip() for h in hosts.split(",") if h.strip()]
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=host_list)

    # Include routers (example)
    from fastapi import APIRouter

    api_v1 = APIRouter(prefix="/api/v1")

    @api_v1.get("/", summary="Service root")
    async def root() -> dict:
        return {"service": settings.SERVICE_NAME, "environment": settings.ENVIRONMENT}

    # Example business endpoint
    @api_v1.get("/items/{item_id}", summary="Get item by id")
    async def get_item(item_id: int, db: Database = Depends(get_db)) -> dict:
        # TODO: replace with real DB call
        healthy = await db.is_healthy()
        if not healthy:
            raise HTTPException(status_code=503, detail="database unavailable")
        return {"item_id": item_id, "name": "example", "db": healthy}

    app.include_router(api_v1)

    # Metrics endpoint
    if settings.METRICS_ENABLED:

        @app.get("/metrics")
        def metrics() -> Response:
            resp = generate_latest(PROM_REGISTRY)
            return Response(content=resp, media_type=CONTENT_TYPE_LATEST)

    # Health endpoints
    @app.get("/health", summary="Health check (composite)")
    async def health(db: Database = Depends(get_db)) -> JSONResponse:
        db_ok = await db.is_healthy()
        status = "ok" if db_ok else "fail"
        code = 200 if db_ok else 503
        return JSONResponse(
            status_code=code,
            content={
                "status": status,
                "checks": {"database": "ok" if db_ok else "unhealthy"},
                "uptime_seconds": int(time.time() - START_TIME),
            },
        )

    @app.get("/live", summary="Liveness probe")
    async def live() -> PlainTextResponse:
        return PlainTextResponse("alive")

    @app.get("/ready", summary="Readiness probe")
    async def ready(db: Database = Depends(get_db)) -> PlainTextResponse:
        ok = await db.is_healthy()
        if ok:
            return PlainTextResponse("ready")
        raise HTTPException(status_code=503, detail="not ready")

    # Exception handler
    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.error("unhandled_exception", path=request.url.path, error=str(exc))
        # Avoid leaking errors in production; return generic message
        if settings.DEBUG:
            return JSONResponse(status_code=500, content={"detail": str(exc)})
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    # Request instrumentation middleware (metrics + logging)
    @app.middleware("http")
    async def add_metrics_and_logging(request: Request, call_next):
        start = time.time()
        endpoint = request.url.path
        method = request.method
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception as e:
            status_code = 500
            raise
        finally:
            latency = time.time() - start
            try:
                REQUEST_COUNT.labels(method, endpoint, str(status_code)).inc()
                REQUEST_LATENCY.labels(endpoint).set(latency)
            except Exception:
                # metrics should not break the request path
                pass
            logger.info(
                "http.request",
                method=method,
                path=endpoint,
                status_code=status_code,
                latency_ms=int(latency * 1000),
            )

    # Startup / Shutdown events
    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("startup.begin", service=settings.SERVICE_NAME, environment=settings.ENVIRONMENT)
        # Connect DB (lazy connect also handled in get_db)
        global _db
        if _db is None:
            _db = Database(settings.DATABASE_DSN)
            await _db.connect()

        # Optional: init tracing, Sentry, caches, task queues
        if settings.OTEL_ENABLED:
            # TODO: initialize OpenTelemetry (OTLP exporter) here
            logger.info("otel.enabled")

        if settings.SENTRY_DSN:
            # TODO: initialize Sentry SDK
            logger.info("sentry.enabled")

        logger.info("startup.complete")

    @app.on_event("shutdown")
    async def on_shutdown() -> None:
        logger.info("shutdown.begin")
        global _db
        if _db is not None:
            await _db.disconnect()
        logger.info("shutdown.complete")

    return app


# ---------------------------------------------------------------------------
# If executed directly, run with uvicorn
# ---------------------------------------------------------------------------

app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_config=None,  # structlog handles logging
        reload=settings.DEBUG,
    )
