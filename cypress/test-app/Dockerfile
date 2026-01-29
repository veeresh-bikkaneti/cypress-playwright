# ============================================================================
# CYPRESS TEST APPLICATION - Dockerfile
# ============================================================================
#
# This Dockerfile creates a containerized test application for Cypress testing.
#
# BUILD STAGES:
# ┌─────────────────────────────────────────────────────────────────────────┐
# │  Stage 1: Base Node.js Image                                            │
# │           └─> Install dependencies                                      │
# │               └─> Copy application files                                │
# │                   └─> Expose port 3000                                  │
# │                       └─> Start server                                  │
# └─────────────────────────────────────────────────────────────────────────┘
#
# USAGE:
#   docker build -t cypress-test-app .
#   docker run -p 3000:3000 cypress-test-app
#
# ============================================================================

# Use official Node.js LTS image (slim for smaller size)
FROM node:18-slim

# Set working directory
WORKDIR /app

# Add labels for documentation
LABEL maintainer="Cypress Migration Framework"
LABEL description="Self-contained test application for Cypress capability demonstration"
LABEL version="1.0.0"

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
# Using npm ci for reproducible builds
RUN npm ci --only=production

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/time', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "server.js"]
