# Appointment Scheduler Frontend

Modern React + TypeScript client for managing appointments. The app provides:

- **Guest booking flow** with calendar, slot selection, and confirmation form.
- **Admin console** for reviewing, cancelling, and rescheduling appointments.
- **MobX-state-tree architecture** for predictable state management.
- **Responsive UI** with Bootstrap styling, snackbars, and loading indicators.

---

## Requirements

- Node.js ≥ 20.x (recommend installing via [nvm](https://github.com/nvm-sh/nvm))
- npm ≥ 10.x (bundled with Node 20)

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/shikhar190399/appointment-fe.git
cd appointment-fe

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# update VITE_API_URL in .env if needed

# 4. Start the development server
npm run dev
```

The dev server launches at [http://localhost:5173](http://localhost:5173) by default.

---

## Environment Variables

| Variable       | Purpose                          | Default                       |
| -------------- | -------------------------------- | ----------------------------- |
| `VITE_API_URL` | Base URL for the Django backend. | `http://localhost:8000`       |

All environment variables are defined in `.env.example`. Copy it to `.env` for local development:

```bash
cp .env.example .env
```

> Vite only exposes variables prefixed with `VITE_`, so keep that prefix for new values.

---

## Available Scripts

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR.            |
| `npm run build`   | Type-check and build the production bundle.|
| `npm run preview` | Preview the production build locally.      |
| `npm run lint`    | Run ESLint on the entire codebase.         |

---

## Project Structure

```
src/
├── components/        # Shared UI primitives (loader, snackbar, etc.)
├── pages/             # Route-level screens (guest, admin, shell)
├── config/            # Runtime configuration helpers
├── hooks/             # Reusable React hooks
├── lib/               # Framework-agnostic utilities (HTTP, etc.)
├── models/            # MobX-state-tree stores and domain models
├── services/          # API clients / integrations
├── styles/            # Global & feature-specific styles
├── utils/             # Pure helper functions
└── main.tsx           # Application entry point
```

The project uses feature-first organization. New slices can live under `src/pages` or `src/models` with related services/components collocated.

---

## State Management and Data Flow

- **MobX-state-tree** (`src/models`) handles domain stores:
  - `appointments-store` coordinates list/cancel/edit operations.
  - `availability-model` handles slot pagination and validation.
- All API requests flow through `src/services/api/*` and the shared `httpClient`.
- Snackbars and loaders provide feedback during async operations.

---

## Production Build & Deployment

```bash
npm run build
# artifacts will be emitted to /dist
```

The `dist/` folder contains static assets ready to deploy to any static host (e.g., Netlify, Vercel, S3 + CloudFront).

---

## Conventions

- **Code style**: follow ESLint + TypeScript rules (`npm run lint`).
- **Environment secrets**: keep them out of version control; `.env` is gitignored.
- **Commit messages**: prefer conventional style (e.g., `feat:`, `fix:`, `chore:`).

---

## Linking to the Backend

The frontend expects the Django API to expose the following endpoints:

- `GET /api/appointments/available?page=<week>` – returns available slot list.
- `POST /api/appointments` – books an appointment.
- `GET /api/appointments?page=<week>` – admin listing.
- `PATCH /api/appointments/:id` – reschedule.
- `DELETE /api/appointments/:id` – cancel.

Make sure `VITE_API_URL` points to the running backend.

---

## Questions?

Open an issue or reach out at [your GitHub profile](https://github.com/shikhar190399). Contributions and suggestions are welcome!
