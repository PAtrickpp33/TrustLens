# TrustLens Backend

FastAPI backend following DDD structure. Includes SQL schema aligned with Alibaba Database Manual conventions and Swagger for API debugging.

## Setup

1. Create and populate `.env` from `.env.example`.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Apply SQL in `sql/schema.sql` to your MySQL instance.
4. Run the app (you will run it manually):
   - `uvicorn app.main:app --reload`

## Structure

- `app/`
  - `api/` – HTTP routers
  - `core/` – configuration and common components
  - `domain/` – entities, repositories, services
  - `infrastructure/` – database and repository implementations
  - `schemas/` – Pydantic schemas
- `sql/` – database DDL

## Notes
- Keep tables and columns lowercase with underscores.
- Use `gmt_create`, `gmt_modified`, and `is_deleted` for soft delete.
- Use `utf8mb4` and InnoDB.
