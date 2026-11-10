# OpenCode Agents - local Docker runtime

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

# OpenCode stores its data under the host-mounted directory.
RUN mkdir -p /app/workspace /app/.opencode-data
ENV XDG_DATA_HOME=/app/.opencode-data/share
ENV XDG_CONFIG_HOME=/app/.opencode-data/config
ENV XDG_STATE_HOME=/app/.opencode-data/state
ENV XDG_CACHE_HOME=/app/.opencode-data/cache
ENV PATH="/root/.opencode/bin:$PATH"

WORKDIR /app/workspace
EXPOSE 4096
CMD ["opencode", "web", "--hostname", "0.0.0.0", "--port", "4096"]
