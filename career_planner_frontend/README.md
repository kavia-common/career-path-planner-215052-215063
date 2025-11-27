# Lightweight React Template for KAVIA

This project provides a minimal React template upgraded with a polished Ocean Professional UI: persistent sidebar, top header, smooth transitions, and modern components.

## Features

- Ocean Professional theme with accessible contrast and tokens
- Persistent, collapsible sidebar with active-route highlighting and icons
- Top header with title, search placeholder, and profile area
- Smooth page transitions (CSS fade/slide)
- Polished components: cards, tables (row hover), forms, buttons, badges
- Responsive layout and keyboard accessibility (focus styles, ARIA)
- Environment-driven API base URL; no credentials hardcoded

## Getting Started

Create a `.env` file (or set environment variables) with:

- REACT_APP_BACKEND_URL=https://<backend-host>:3001
  - If not set, the app will infer http(s)://<current-host>:3001 during development.
- REACT_APP_SUPABASE_URL=...
- REACT_APP_SUPABASE_ANON_KEY=...
- REACT_APP_SITE_URL=https://<your-frontend-host> (optional; defaults to window.location.origin)

The app reads the backend base URL from REACT_APP_BACKEND_URL and forwards the Supabase JWT automatically via the api client.

Commands:

- npm start — dev server at http://localhost:3000
- npm test — run tests (CI mode)
- npm run build — production build

## UI & Theme Customization

- Theme tokens and layout styles live in src/components/layout.css.
  - Adjust colors, spacing, radii, and shadows by editing CSS variables at the top of the file.
  - Dark mode uses the [data-theme="dark"] variables automatically.
- The persistent layout is implemented in src/components/Layout.js. It provides:
  - Collapsible sidebar with icons and route highlights
  - Top header with search box placeholder and profile area
  - Route transition wrapper for smooth page changes
- Page components remain in src/pages/* and automatically inherit the theme.
- Accessibility:
  - Interactive elements have focus-visible outlines and ARIA labels where relevant.
  - Tables include hover states and readable header styles.

## CRUD Flows (Create/Update)

- Users page: "Add User" opens a dialog to POST /db/users. Each row has "Edit" which PUTs /db/users/{id}. The User Detail page also provides an Edit dialog.
- Roles page: "Add Role" opens a dialog to POST /db/roles. Each role row has "Edit" which PUTs /db/roles/{id}. Reads primarily via /roles with a fallback to /db/roles.
- Competencies page: Users can adjust self-level via PUT /competencies/{id}. Admins see "Add Competency" to POST /db/competencies and can edit via PUT /db/competencies/{id}.

Validation happens client-side (required fields, email format) and API errors are surfaced in-line. Auth token is forwarded automatically from Supabase session via apiClient.

## Catalog Data and Empty States

If the catalog is not seeded yet, the UI shows helpful empty-state messages; Admin can trigger ingestion from the Admin page once backend wiring is connected.

## Learn More

To learn React, check out the React documentation: https://reactjs.org/
