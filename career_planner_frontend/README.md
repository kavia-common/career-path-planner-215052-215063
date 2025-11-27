# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

Create a `.env` file (or set environment variables in your deployment) with:

- REACT_APP_BACKEND_URL=https://<backend-host>:3001
- REACT_APP_SUPABASE_URL=...
- REACT_APP_SUPABASE_ANON_KEY=...
- REACT_APP_SITE_URL=https://<your-frontend-host> (optional; defaults to window.location.origin)

The app reads the backend base URL from REACT_APP_BACKEND_URL and sends requests to that origin.

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## CRUD Flows (Create/Update)

- Users page: "Add User" opens a dialog to POST /db/users. Each row has "Edit" which PUTs /db/users/{id}. The User Detail page also provides an Edit dialog.
- Roles page: "Add Role" opens a dialog to POST /db/roles. Each role row has "Edit" which PUTs /db/roles/{id}. Reads primarily via /roles with a fallback to /db/roles.
- Competencies page: Users can adjust self-level via PUT /competencies/{id}. Admins see "Add Competency" to POST /db/competencies and can edit via PUT /db/competencies/{id}.

Validation happens client-side (required fields, email format) and API errors are surfaced in-line. Auth token is forwarded automatically from Supabase session via apiClient.

## Catalog Data and Empty States

Role/competency catalog and adjacency data are provided by the FastAPI backend. If the catalog is not seeded yet, the frontend will show helpful empty-state messages (no hard errors). Admin users can use the Admin page to trigger ingestion once the backend wiring is connected.

## Customization

The Ocean Professional theme lives in `src/App.css`. Common components use CSS utility classes (no UI library).

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
