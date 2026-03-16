# Railway Deployment Guide — Local Loop Directory Canary

## Overview

The Dockerfile builds a **single service** image: Express serves the API at `/api/...`
and the compiled React frontend at `/`. Railway injects `DATABASE_URL` and `PORT` at
runtime. On startup the container automatically runs `drizzle-kit push` to create all
10 database tables before the server starts.

---

## Step 1 — Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Authorise Railway to access your GitHub account if prompted
4. Select the repository: `mcsadmin/canary-directory-replit`
5. Railway detects the `Dockerfile` at the root automatically — leave it as-is
6. Click **Deploy** to create the service (it will fail at first — that's fine, you need
   the database first)

---

## Step 2 — Add a PostgreSQL database

In your Railway project:

1. Click **+ New** in the top-right corner
2. Choose **Database** → **PostgreSQL**
3. Wait ~30 seconds for it to provision

---

## Step 3 — Link DATABASE_URL to your service

1. Click your **main service** (the one linked to GitHub)
2. Go to the **Variables** tab
3. Click **+ Add Variable Reference**
4. Select your PostgreSQL service from the dropdown
5. Choose `DATABASE_URL`

Railway keeps this in sync automatically if the database URL ever changes.

> **Note:** You do **not** need to set `PORT` — Railway injects it automatically.

---

## Step 4 — (Optional) App-specific variables

In the same **Variables** tab, add these if you want non-default values:

| Variable                   | Default | Description                                   |
|----------------------------|---------|-----------------------------------------------|
| `CATCHMENT_POSTCODE_PREFIX`| `WA7`   | Local catchment area postcode prefix           |
| `MATCH_UPPER_THRESHOLD`    | `80`    | High-confidence match score (0–100)            |
| `MATCH_LOWER_THRESHOLD`    | `15`    | Medium-confidence match score (0–100)          |

---

## Step 5 — Trigger a deploy

1. Click **Deploy** on your main service (or push a new commit to `master`)
2. Watch the build log — the Docker build takes 2–3 minutes on first run
3. Once the log shows `Server listening on port ...` the service is live

Click the Railway-generated domain at the top of your service page — the operator
dashboard will load.

---

## Step 6 — Seed the external dataset (optional, recommended)

The external dataset (4 company records used for entity resolution) is seeded via a
script. Run it once from Railway's shell:

1. Click your service → **Shell** tab
2. Run:

```bash
pnpm --filter @workspace/scripts run seed
```

This is idempotent — safe to run multiple times.

---

## Ongoing deployments

Every `git push origin master` from Replit triggers an automatic redeploy on Railway.
The schema push on startup is idempotent so it is safe to run on every boot.

To push from Replit shell:

```bash
cd /home/runner/workspace && git push origin master
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails at `pnpm install` | Lock file mismatch | Run `pnpm install` locally, commit `pnpm-lock.yaml`, push again |
| Container starts but DB tables missing | `DATABASE_URL` not linked | Check Variables tab, ensure DATABASE_URL is set |
| Frontend shows blank page | `BASE_PATH` build issue | Redeploy — Dockerfile sets `BASE_PATH=/` during build |
| `Server listening` never appears | `PORT` not set | Railway sets this automatically; check service isn't crashing on startup |
