FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .
COPY common/ ./common/
COPY services/categories/ ./services/categories/

RUN pip install --no-cache-dir fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic[email]

WORKDIR /app/services/categories

ENV PYTHONPATH=/app

EXPOSE 8003

CMD ["python", "run.py"]
