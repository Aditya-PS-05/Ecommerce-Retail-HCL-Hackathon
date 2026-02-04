FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .
COPY common/ ./common/
COPY services/inventory/ ./services/inventory/

RUN pip install --no-cache-dir fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic[email]

WORKDIR /app/services/inventory

ENV PYTHONPATH=/app

EXPOSE 8005

CMD ["python", "run.py"]
