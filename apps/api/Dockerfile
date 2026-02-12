# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy API source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client & Build
WORKDIR /app/apps/api
RUN yarn prisma generate
RUN yarn build

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

# Create upload directories
RUN mkdir -p uploads/images/equipments uploads/documents/equipments

EXPOSE 3000

CMD ["node", "dist/main"]