from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # Ensure all models are registered

# Import API routers
from app.api.v1 import auth, users, vehicles, rides, requests as ride_requests, chat, ratings, safety

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global human-friendly error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error details on server
    print(f"[ERROR] Global exception: {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."}
    )

# Root status
@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs_url": "/docs"
    }

# Include API v1 routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(rides.router, prefix=settings.API_V1_STR)
app.include_router(ride_requests.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(ratings.router, prefix=settings.API_V1_STR)
app.include_router(safety.router, prefix=settings.API_V1_STR)
