# OpenCode Agents - Fly.io Deployment
# Optimized for AI-assisted development workflows

FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    openssh-client \
    jq \
    && rm -rf /var/cache/apk/*

# Install OpenCode CLI
RUN curl -fsSL https://opencode.ai/install | bash

# Set up working directory
WORKDIR /app

# Copy repository files
COPY . .

# Install Node.js dependencies for .opencode
RUN cd .opencode && npm install --production && cd ..

# Create volume mount point (will be overlaid by Fly volume)
RUN mkdir -p /app/.opencode-data

# Set environment defaults
ENV NODE_ENV=production
ENV OPENCODE_DATA_DIR=/app/.opencode-data

# Keep container running for SSH access
CMD ["sleep", "infinity"]
