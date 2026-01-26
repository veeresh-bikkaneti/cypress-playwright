# =============================================================================
# CYPRESS E2E TESTING - Dockerfile (Optional standalone runner)
# =============================================================================
# This Dockerfile is for building a custom Cypress image if needed.
# For most use cases, use docker-compose.yml with the official image.
# =============================================================================

FROM cypress/included:13.17.0

WORKDIR /e2e

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy test files
COPY . .

# Default command
CMD ["cypress", "run", "--env", "allure=true"]
