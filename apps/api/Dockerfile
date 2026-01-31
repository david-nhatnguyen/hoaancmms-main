# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
# Copy web package.json để npm ci không bị lỗi do thiếu workspace
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies (bao gồm cả devDependencies để build)
RUN npm ci

# Copy source code
COPY apps/api ./apps/api

# Build NestJS app
WORKDIR /app/apps/api
RUN npm run build

# Tối ưu hóa: Xóa bỏ devDependencies để giảm dung lượng image
WORKDIR /app
RUN npm prune --production

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts từ builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]