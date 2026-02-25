# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
# Build-time args for Vite dev/prod targets. These are read by vite.config.js
# Example: --build-arg VITE_API_TARGET=http://host:5000 --build-arg VITE_B2B_API_TARGET=http://host:5001
ARG VITE_API_TARGET=https://gokite-staging.odoo.com
ARG VITE_B2B_API_TARGET=http://localhost:5001
# VITE_API_BASE_URL MUST be empty so the built JS uses relative URLs (e.g. /api/...).
# nginx then proxies those to the real backend.
# Setting it to an external URL causes the browser to call it directly → CORS.
ARG VITE_API_BASE_URL=

# Export as env so vite.config.js (process.env) can pick them up during `npm run build`
ENV VITE_API_TARGET=${VITE_API_TARGET}
ENV VITE_B2B_API_TARGET=${VITE_B2B_API_TARGET}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Install dependencies first (layer-cached unless package files change)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config template (will be envsubst'd at container start)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Install envsubst (gettext) so we can substitute environment variables at runtime
RUN apk add --no-cache gettext

# Copy entrypoint script and make executable
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
