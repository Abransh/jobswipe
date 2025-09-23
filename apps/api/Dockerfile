# ==============================================================================
# JobSwipe API - Production Dockerfile
# ==============================================================================

# Use official Node.js LTS Alpine image for minimal size
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# ==============================================================================
# Dependencies Stage - Install all dependencies
# ==============================================================================
FROM base AS deps

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# ==============================================================================
# Build Stage - Build the application
# ==============================================================================
FROM base AS builder

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm and all dependencies (including dev)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application (using full version)
RUN pnpm run build:production

# ==============================================================================
# Production Stage - Final production image
# ==============================================================================
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=3001
ENV API_HOST=0.0.0.0

# Switch to nodejs user for security
USER nodejs

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]