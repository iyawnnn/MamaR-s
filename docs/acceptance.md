# Phase 1 Acceptance Criteria

Before Phase 1 sign-off, ensure:

- [ ] docs/project-charter.md present and reviewed
- [ ] docs/requirements.md complete
- [ ] docs/data-model.md lists all collections with validation rules & sample documents
- [ ] docs/api-spec.md lists endpoints with example requests/responses
- [ ] docs/wireframes.* prepared for Dashboard, Products, Sales, Expenses, Reports, Login
- [ ] Postman / API contract examples present in docs/postman-collection.json
- [ ] Repo contains `frontend/`, `backend/`, `docs/` and initial commits
- [ ] `.env.example` present and `.env` ignored
- [ ] MongoDB Atlas cluster provisioned (M0) and credentials stored in secret manager / .env on dev
- [ ] Phase 1 signoff meeting scheduled & notes saved at docs/meetings/phase1-signoff.md

## Basic test cases (manual)
- Create product (POST /api/products) → returns 201 and stored in DB.
- List products (GET /api/products) → includes totalValue and lowStock flag.
- Auth: POST /api/auth/login returns token for seeded admin.
- Repo README references docs and next steps.
