from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.responses import StreamingResponse


from routes.airspace import router as AirspaceRouter
from routes.constraints import router as ConstraintsRouter
from routes.health import router as HealthRouter
from routes.flight_strips import router as FlightStripsRouter
from infrastructure.mongodb_client import mongodb_client
from schemas.api import ApiException
import logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event for the FastAPI application.
    Manages MongoDB connection lifecycle.
    """
    # Startup
    try:
        await mongodb_client.connect()
        await mongodb_client.create_indexes()
        logging.info("Application startup completed")
    except Exception as e:
        logging.error(f"Failed to initialize application: {e}")
        raise

    yield

    # Shutdown
    try:
        await mongodb_client.disconnect()
        logging.info("Application shutdown completed")
    except Exception as e:
        logging.error(f"Error during application shutdown: {e}")


app = FastAPI(
    title="UTM Observer API",
    description=(
        "BR-UTM Observer Backend Service for managing for ecosystem"
        " interaction"
    ),
    version="1.0.0",
    lifespan=lifespan,
    root_path="/api",
)

logging.basicConfig(
    level=logging.DEBUG,
)


@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        logging.info(
            f"[API REQUEST] {request.method} {request.url.path} - "
            f"Headers: {request.headers}, "
            f"Body: {await request.body()}"
        )
        response = await call_next(request)
        body = b"".join([chunk async for chunk in response.body_iterator])
        logging.info(
            f"[API RESPONSE] {request.method} {request.url.path} - Status:"
            f" {response.status_code}, Headers: {response.headers}, Body:"
            f"{body}"
        )
        return StreamingResponse(
            iter([body]),
            status_code=response.status_code,
            headers=response.headers,
            media_type=response.media_type,
            background=response.background,
        )
    except Exception as e:
        if hasattr(e, "status_code"):
            raise e

        raise ApiException(
            status_code=500,
            message=str(e),
        )


origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(AirspaceRouter, tags=["Airspace"])
app.include_router(ConstraintsRouter, tags=["Constraints"])
app.include_router(HealthRouter, tags=["Health"])
app.include_router(FlightStripsRouter, tags=["Flight Strips"])
