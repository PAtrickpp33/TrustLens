# syntax=docker/dockerfile:1

# Multi-stage build for FastAPI (Uvicorn) compatible with Coolify

FROM python:3.11-slim AS builder

# Faster, quieter pip and Python behavior during build
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /install

# System deps for building wheels when prebuilt wheels are unavailable
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a staging prefix
COPY requirements.txt ./
RUN pip install --prefix=/install -r requirements.txt


FROM python:3.11-slim

# Consistent runtime behavior
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8001

WORKDIR /app

# Bring in site-packages from the builder stage
COPY --from=builder /install /usr/local

# Copy application source
COPY app ./app
COPY sql ./sql

# Create non-root user for security
RUN useradd -m -u 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

# FastAPI default port
EXPOSE 8001

# Coolify will inject environment variables. If you use a .env file, mount it to /app/.env
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]


