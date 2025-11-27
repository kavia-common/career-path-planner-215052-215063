# career-path-planner-215052-215063

This workspace contains the frontend React app. The backend (FastAPI) exposes REST endpoints used by the UI.

New/updated endpoints (FastAPI):
- POST /db/users — Create user { name, email }. Validates required name and basic email format; conflicts on duplicate email return 409 if unique enforced.
- PUT /db/users/{id} — Update user by id. 404 if not found.
- POST /db/roles — Create role { code, name, summary? }.
- PUT /db/roles/{id} — Update role by id. 404 if not found.
- POST /db/competencies — Create competency { code, name, category? }.
- PUT /db/competencies/{id} — Update competency by id. 404 if not found.

Frontend create/edit flows:
- Users: Add/Edit dialogs on list; Edit on detail.
- Roles: Add/Edit dialogs on list.
- Competencies: Self-assessment update and admin Add/Edit for catalog.

Configuration:
- Frontend uses REACT_APP_BACKEND_URL for base API.
- Backend should use DATABASE_URL for DB access. Do not hardcode credentials.

Refer to backend /docs for full OpenAPI schema (summaries & tags updated).