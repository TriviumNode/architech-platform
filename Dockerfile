# Use a Node.js base image
FROM node:18-alpine

# Enable corepack to manage package manager versions (e.g., Yarn)
RUN corepack enable

# Set the working directory
WORKDIR /app

# Copy root package manager files
COPY package.json yarn.lock .yarnrc.yml ./
# Copy turbo configuration
COPY turbo.json ./

# --- Monorepo setup ---
# Create directory structure for the backend app's package.json
# This helps Docker cache layers better if only app code changes
RUN mkdir -p apps/backend
COPY apps/backend/package.json ./apps/backend/package.json

# Copy workspace packages if they exist and are needed
# If your 'packages' dir is large and not all are needed, this could be optimized
COPY packages ./packages

# Install all dependencies declared in workspaces
RUN yarn install

# Copy the backend application source code
COPY apps/backend ./apps/backend

# Build the backend application
# Assumes 'architech-backend' is the correct package name for the filter
RUN yarn turbo run build --filter=architech-backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
# The backend's package.json start script is "npm run build && cross-env NODE_ENV=production node dist/server.js"
# We've already built, so we just need to run the server.
CMD ["node", "apps/backend/dist/server.js"] 