from http import HTTPStatus
from fastapi import APIRouter, Depends
from utils.correlation import correlation_id_dependency
from schemas.api import ApiException, ApiResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"], prefix="/healthy")


@router.get(
    "/",
    response_model=ApiResponse,
    status_code=HTTPStatus.OK.value,
)
async def health_check(correlation_id: str = Depends(correlation_id_dependency)):
    logger.info("Health check endpoint called")
    return ApiResponse(
        message="OK",
        data={"correlation_id": correlation_id}
    )
