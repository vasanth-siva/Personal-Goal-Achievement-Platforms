# ==============================================================================
# GoalForge Frontend - Production Dockerfile
# Multi-stage build for ultra-compact static asset deployment
# ==============================================================================

# Stage 1: Build the Vite production bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications and install cleanly
COPY package*.json ./
RUN npm ci

# Copy full frontend source code
COPY . .

# Build production distribution bundle
RUN npm run build

# Stage 2: Serve compiled distribution with Nginx Alpine
FROM nginx:alpine AS runner

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
