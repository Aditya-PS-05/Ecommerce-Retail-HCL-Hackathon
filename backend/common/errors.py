from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from typing import Optional


class ErrorResponse(BaseModel):
    status_code: int
    error_code: str
    message: str
    details: Optional[dict] = None


class AppException(Exception):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[dict] = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details
        super().__init__(message)


def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status_code": exc.status_code,
                "error_code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        error_codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
            500: "INTERNAL_ERROR"
        }
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status_code": exc.status_code,
                "error_code": error_codes.get(exc.status_code, "ERROR"),
                "message": exc.detail
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        return JSONResponse(
            status_code=422,
            content={
                "status_code": 422,
                "error_code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": {"errors": errors}
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "status_code": 500,
                "error_code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred"
            }
        )
