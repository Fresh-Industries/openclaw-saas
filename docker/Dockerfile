FROM node:20-alpine

# Install OpenClaw dependencies
RUN apk add --no-cache \
    git \
    openssh-client \
    ca-certificates \
    tzdata \
    ffmpeg \
    imagemagick \
    sox

# Install OpenClaw
RUN npm install -g openclaw

# Create app directory
WORKDIR /app

# Copy user configurations
COPY ./config /etc/openclaw/users

# Run as non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start OpenClaw
CMD ["openclaw", "--config", "/etc/openclaw/users/default/config.json"]
