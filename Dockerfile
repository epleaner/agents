# OpenCode Agents - Cloud Deployment (Railway/Fly.io)
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

# Install OpenCode CLI and ensure it's in PATH
RUN curl -fsSL https://opencode.ai/install | bash \
    && ln -sf /root/.opencode/bin/opencode /usr/local/bin/opencode

# Set up working directory
WORKDIR /app

# Copy repository files
COPY . .

# Install Node.js dependencies for .opencode
RUN cd .opencode && npm install --production && cd ..

# Create volume mount points
RUN mkdir -p /app/.opencode-data /app/data

# Set environment defaults
ENV NODE_ENV=production
ENV OPENCODE_DATA_DIR=/app/.opencode-data
ENV PATH="/root/.opencode/bin:$PATH"

# Default command - Railway uses startCommand from railway.json
# Fly.io uses sleep infinity for SSH access
CMD ["bash", ".opencode/scripts/start-railway.sh"]
