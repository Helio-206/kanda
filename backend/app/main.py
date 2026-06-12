from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from app.config import settings
from app.routers import dashboard, occurrences
from app.services.cloudinary import init_cloudinary

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

# CORS - permissive for development. Lock this down in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(occurrences.router)
app.include_router(dashboard.router)


@app.on_event("startup")
async def startup_event():
    # initialize cloudinary if configured
    init_cloudinary(settings)

    # register tortoise ORM
    register_tortoise(
        app,
        db_url=settings.DATABASE_URL,
        modules={"models": ["app.models"]},
        generate_schemas=True,  # in production you would use migrations instead
        add_exception_handlers=True,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}
