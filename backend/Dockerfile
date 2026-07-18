# Stage 1: install production dependencies only. This layer is cached until
# package*.json changes, so code edits rebuild in seconds.
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: slim runtime image — no npm cache, no dev dependencies, and the
# build tools from stage 1 are left behind entirely.
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Never run as root inside the container: a compromised app process gets an
# unprivileged user, not the container's root.
USER node

EXPOSE 5000
CMD ["node", "server.js"]
