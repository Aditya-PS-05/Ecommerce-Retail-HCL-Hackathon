FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .
COPY common/ ./common/
COPY services/auth/ ./services/auth/

RUN pip install --no-cache-dir fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic[email]

WORKDIR /app/services/auth

ENV PYTHONPATH=/app

EXPOSE 8001

CMD ["python", "run.py"]
