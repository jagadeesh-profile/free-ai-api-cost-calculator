# Multi-stage build for optimized image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (if you add build steps later)
# COPY package*.json ./
# RUN npm install

# Copy static files
COPY public/ ./public/

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files from builder
COPY --from=builder /app/public /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Labels for metadata
LABEL maintainer="your-email@example.com"
LABEL version="1.0"
LABEL description="AI API Cost Calculator - Production Ready"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]