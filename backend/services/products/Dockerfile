FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .
COPY common/ ./common/
COPY services/products/ ./services/products/

RUN pip install --no-cache-dir fastapi uvicorn pymongo python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv pydantic[email]

WORKDIR /app/services/products

ENV PYTHONPATH=/app

EXPOSE 8002

CMD ["python", "run.py"]
