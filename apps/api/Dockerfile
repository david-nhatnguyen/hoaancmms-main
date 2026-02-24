
# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Copy Prisma schema before installing dependencies because of postinstall script
COPY apps/api/prisma ./apps/api/prisma

# Install all dependencies (ignore scripts to prevent premature Prisma generation)
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy API source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client & Build
WORKDIR /app/apps/api
RUN npx prisma generate
RUN rm -f tsconfig.tsbuildinfo && yarn build

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install dumb-init for proper process handling
RUN apk add --no-cache dumb-init

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./prisma.config.ts

# Create upload directories and set non-root ownership
RUN mkdir -p uploads/images/equipments uploads/documents/equipments \
    && chown -R node:node /app

# Switch to non-root user for security
USER node

EXPOSE 3000

# Start the node process directly with Prisma migration
CMD ["sh", "-c", "npx prisma migrate deploy && dumb-init node dist/src/main"]