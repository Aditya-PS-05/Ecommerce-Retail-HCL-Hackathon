from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.config import settings
from app.routes import auth, users, products, categories, orders, inventory, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    yield
    close_mongo_connection()


app = FastAPI(
    lifespan=lifespan,
    title="Retail Portal API",
    description="E-commerce backend API with JWT authentication and RBAC",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Retail Portal API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(search.router, prefix="/api")
