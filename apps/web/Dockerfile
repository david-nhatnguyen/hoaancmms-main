# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (giống API để npm ci hoạt động)
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build React App
WORKDIR /app/apps/web

# Nhận biến môi trường từ Build Args (quan trọng cho Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN yarn build

# --- Stage 2: Runner (Nginx) ---
FROM nginx:alpine AS runner

# Copy file build tĩnh vào thư mục phục vụ của Nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# Copy cấu hình Nginx custom
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]