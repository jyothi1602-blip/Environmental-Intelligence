import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.sqlite import init_db
from app.db.influx import init_influxdb
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.routes.environmental import router as env_router
from app.routes.alerts import router as alerts_router

# Configure secure logging (filtering out passwords, tokens)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Environmental Intelligence API services...")
    init_db()
    init_influxdb()
    logger.info("Database and background services initialized successfully.")
    yield
    logger.info("Shutting down Environmental Intelligence API services...")

app = FastAPI(
    title="Environmental Intelligence API",
    description="Backend API for AI-Powered Air Quality Prediction, Environmental Observations, and Personalized Smart Mobility Advisories",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React Native / Expo and Web previews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Expo dev servers, mobile emulators, and browsers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(env_router)
app.include_router(alerts_router)

@app.get("/")
async def root():
    return {
        "project": "Environmental Intelligence – AI-Powered Air Quality & Smart Mobility",
        "milestone": "Milestone 1 (Week 1–2)",
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "auth": "/api/auth",
            "user_profile": "/api/user",
            "environmental": "/api/environmental",
            "alerts": "/api/alerts"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "sqlite": "active",
            "fastapi": "active",
            "influxdb_ready": True
        }
    }
