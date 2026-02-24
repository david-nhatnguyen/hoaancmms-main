# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (giống API để npm ci hoạt động)
COPY package.json yarn.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies (ignore postinstall scripts like Prisma)
RUN yarn install --frozen-lockfile --ignore-scripts

# Copy root tsconfig for Vite PWA plugin resolution
COPY tsconfig.json ./

# Copy source code
COPY apps/web ./apps/web

# Build React App
WORKDIR /app/apps/web

# Nhận biến môi trường từ Build Args (quan trọng cho Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build React App (bypass tsc checks for Docker build)
RUN npx vite build

# --- Stage 2: Runner (Nginx, non-root) ---
FROM nginx:alpine AS runner

# Clean default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy file build tĩnh vào thư mục phục vụ của Nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# Copy cấu hình Nginx custom
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Setup non-root execution permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]