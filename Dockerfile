# ======================================================
# Local Loop Directory Canary — Railway Dockerfile
# Single-stage: install, build frontend, run server
# ======================================================

FROM node:22-slim
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace manifests first (layer cache for installs)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY lib/db/package.json                   lib/db/
COPY lib/api-spec/package.json             lib/api-spec/
COPY lib/api-zod/package.json              lib/api-zod/
COPY lib/api-client-react/package.json     lib/api-client-react/
COPY scripts/package.json                  scripts/
COPY artifacts/api-server/package.json     artifacts/api-server/
COPY artifacts/operator-ui/package.json    artifacts/operator-ui/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/

# Install all dependencies (dev deps needed for tsx + vite build)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build the frontend (output: artifacts/operator-ui/dist/public)
RUN PORT=3000 BASE_PATH=/ NODE_ENV=production \
    pnpm --filter @workspace/operator-ui run build

EXPOSE 8080

# Push DB schema then start the Express server
# DATABASE_URL and PORT are injected by Railway at runtime
CMD sh -c "pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run start"
