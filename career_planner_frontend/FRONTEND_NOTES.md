# Career Planner Frontend

Environment variables (copy .env.example to .env and fill values):
- REACT_APP_BACKEND_URL — Base URL to the FastAPI backend (e.g., https://...:3001). Do NOT include a trailing slash.
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_SITE_URL (optional; defaults to window.location.origin)

Main routes:
- /login — Supabase email/password login
- / — Dashboard with D3 gap analysis
- /roles — Role Navigator (search/filter over roles catalog)
- /roles/:roleId — Role detail with required competencies
- /competencies — Competency Explorer with self-assessment (Beginner/Intermediate/Advanced)
- /plans — Plans and goals
- /users — Users list (DB-backed)
- /users/:userId — User detail (DB-backed)
- /admin — Admin tools (ingestion trigger and catalog views; admin only)

Auth:
- Uses Supabase JWT; forwards to backend via Authorization: Bearer <token>
- RBAC: UI restricts Admin page based on profile.is_admin (retrieved from GET /users/me)

Theme & Layout:
- Ocean Professional theme centralized in `src/components/layout.css` (light/dark tokens).
- Persistent, collapsible sidebar and top header provided by `src/components/Layout.js`.
- Page transitions are CSS-driven for smooth fades/slides.

Backend endpoints (align to FastAPI; DB-backed under /db):
- GET /users/me
- GET /roles
- GET /roles/{id}
- GET /roles/{id}/competencies
- GET /competencies (user-owned)
- PUT /competencies/{id} { self_level }
- GET /gaps
- GET /plans
- GET /goals
- GET /competencies/catalog (admin-readable catalog)
- POST /admin/ingestion/trigger
- GET /admin/ingestion/runs
- GET /db/users
- GET /db/users/{id}
- GET /db/roles
- GET /db/competencies
- GET /db/roles/{role_id}/adjacent

Catalog seeding and empty states:
- If catalog endpoints return an empty array (no JSON seeded yet), UI shows guidance messages and does not error.
- Admin page provides ingestion controls to seed from spreadsheets when backend wiring is available.

Update if backend endpoints differ.
