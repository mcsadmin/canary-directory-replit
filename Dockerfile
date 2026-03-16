# ======================================================
# Local Loop Directory Canary — Railway Dockerfile
# Single image: Express API + built React frontend
# ======================================================

FROM node:22-alpine AS base
RUN npm install -g pnpm@10

# -------------------------------------------------------
# DEPS: install all workspace dependencies
# Copy package.json files first for layer caching
# -------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

COPY lib/db/package.json                  lib/db/
COPY lib/api-spec/package.json            lib/api-spec/
COPY lib/api-zod/package.json             lib/api-zod/
COPY lib/api-client-react/package.json    lib/api-client-react/
COPY scripts/package.json                 scripts/
COPY artifacts/api-server/package.json    artifacts/api-server/
COPY artifacts/operator-ui/package.json   artifacts/operator-ui/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/

RUN pnpm install --frozen-lockfile

# -------------------------------------------------------
# BUILDER: copy source and build the frontend
# -------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules            ./node_modules
COPY --from=deps /app/lib/db/node_modules     ./lib/db/node_modules
COPY --from=deps /app/lib/api-client-react/node_modules ./lib/api-client-react/node_modules
COPY --from=deps /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=deps /app/artifacts/operator-ui/node_modules ./artifacts/operator-ui/node_modules
COPY --from=deps /app/scripts/node_modules    ./scripts/node_modules

# Copy all source
COPY . .

# Build frontend — BASE_PATH=/ so all assets are rooted at /
# Output lands at artifacts/operator-ui/dist/public
RUN PORT=3000 BASE_PATH=/ NODE_ENV=production \
    pnpm --filter @workspace/operator-ui run build

# -------------------------------------------------------
# RUNNER: lean production image
# -------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy installed packages
COPY --from=builder /app/node_modules            ./node_modules
COPY --from=builder /app/lib/db/node_modules     ./lib/db/node_modules
COPY --from=builder /app/lib/api-client-react/node_modules ./lib/api-client-react/node_modules
COPY --from=builder /app/artifacts/api-server/node_modules ./artifacts/api-server/node_modules
COPY --from=builder /app/scripts/node_modules    ./scripts/node_modules

# Copy source (needed for tsx)
COPY --from=builder /app/lib                  ./lib
COPY --from=builder /app/artifacts/api-server ./artifacts/api-server
COPY --from=builder /app/scripts              ./scripts
COPY --from=builder /app/package.json         ./package.json
COPY --from=builder /app/pnpm-workspace.yaml  ./pnpm-workspace.yaml

# Copy the built frontend — Express will serve this at /
COPY --from=builder /app/artifacts/operator-ui/dist/public ./artifacts/operator-ui/dist/public

EXPOSE 8080

# Push schema to DB then start the server
# DATABASE_URL is injected by Railway at runtime
CMD sh -c "pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run start"
