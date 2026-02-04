FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY common/ ./common/
COPY services/ ./services/

# Set Python path
ENV PYTHONPATH=/app

# Default to auth service (override with Railway env var)
ENV SERVICE=auth
ENV PORT=8000

# Start command
CMD python services/${SERVICE}/run.py
