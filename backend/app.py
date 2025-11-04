from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.responses import StreamingResponse


from routes.airspace import router as AirspaceRouter
from routes.constraints import router as ConstraintsRouter
from routes.health import router as HealthRouter
from routes.flight_strips import router as FlightStripsRouter
from routes.drone_mappings import router as DroneMappingsRouter
from infrastructure.mongodb_client import mongodb_client
from infrastructure.event_service import EventService
from infrastructure.correlation import setup_correlation_logging, CorrelationIdManager
from middleware.correlation import CorrelationIdMiddleware
from config.config import Settings
from config.event_mappings import get_event_stream_for_request
from schemas.api import ApiException
import logging

# Global settings and event service instances
settings = Settings()
event_service = EventService(settings)


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

        # Log event service configuration
        if settings.EVENT_API_URL:
            logging.info(
                f"Event dispatching enabled to: {settings.EVENT_API_URL}"
            )
        else:
            logging.warning(
                "Event API URL not configured - events will not be dispatched"
            )

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

# Setup correlation ID logging
setup_correlation_logging()


@app.middleware("http")
async def dispatch_events_middleware(request: Request, call_next):
    """
    Middleware to dispatch events to external event API based on route mappings
    """
    # Process the request first
    response = await call_next(request)

    # Only dispatch events for successful responses (2xx status codes)
    if settings.EVENT_DISPATCH_ENABLED and 200 <= response.status_code < 300:
        try:
            # Get the event stream for this request
            event_stream = get_event_stream_for_request(
                method=request.method, path=request.url.path
            )

            if event_stream:
                # Dispatch event asynchronously (correlation ID will be automatically retrieved from context)
                event_service.dispatch_event_async(event_stream)

                logging.debug(
                    f"Event dispatched: {event_stream} for"
                    f" {request.method} {request.url.path}"
                )
            else:
                logging.debug(
                    "No event mapping found for"
                    f" {request.method} {request.url.path}"
                )

        except Exception as e:
            # Don't let event dispatch errors affect the main response
            logging.error(f"Error in event dispatch middleware: {str(e)}")

    return response


@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        # Get correlation ID for logging (will be available from correlation middleware)
        correlation_id = CorrelationIdManager.get_correlation_id()
        
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


# Add correlation ID middleware (should be added early in the middleware stack)
app.add_middleware(CorrelationIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(AirspaceRouter, tags=["Airspace"])
app.include_router(ConstraintsRouter, tags=["Constraints"])
app.include_router(HealthRouter, tags=["Health"])
app.include_router(FlightStripsRouter, tags=["Flight Strips"])
app.include_router(DroneMappingsRouter, tags=["Drone Mappings"])
