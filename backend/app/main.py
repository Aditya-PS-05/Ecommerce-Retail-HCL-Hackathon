from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Retail Portal API",
    description="E-commerce backend API with JWT authentication and RBAC",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
