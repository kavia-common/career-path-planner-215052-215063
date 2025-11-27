# Career Planner Frontend

Environment variables (copy .env.example to .env and fill values):
- REACT_APP_BACKEND_URL
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_SITE_URL (optional; defaults to window.location.origin)

Main routes:
- /login — Supabase email/password login
- / — Dashboard with D3 gap analysis
- /roles — Role catalog
- /roles/:roleId — Role detail with required competencies
- /competencies — Self-assessment (Beginner/Intermediate/Advanced)
- /plans — Plans and goals
- /admin — Admin tools (ingestion trigger and catalog views; admin only)

Auth:
- Uses Supabase JWT; forwards to backend via Authorization: Bearer <token>
- RBAC: UI restricts Admin page based on profile.is_admin (retrieved from GET /users/me)

Theme:
- Ocean Professional as CSS variables, light/dark toggle in sidebar

Backend endpoints assumed (align to FastAPI):
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

Update if backend endpoints differ.
