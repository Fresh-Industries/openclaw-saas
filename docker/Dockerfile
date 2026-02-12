# OpenClaw Multi-Tenant Container
# Uses the official coollabsio/openclaw image
# Each user gets their own container with their own config

FROM coollabsio/openclaw:latest

# Multi-tenant configuration
# The API passes user-specific config via environment or volume mount
ENV OPENCLAW_GATEWAY_BIND=lan
ENV OPENCLAW_GATEWAY_PORT=18789

# Allow configuration via mounted config
# User config should be mounted to /data/openclaw_{USER_ID}.json
# And OPENCLAW_CONFIG_PATH set accordingly

# Create user data directories
RUN mkdir -p /data/users

# Copy user configuration template (placeholder)
# Actual user configs are injected by the API
COPY ./docker/user-config-template.json /data/users/template.json

# Expose internal gateway port
EXPOSE 18789

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:18789/health || exit 1

# Entry point is already set in the base image
# The API manages container lifecycle
