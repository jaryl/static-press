FROM node:20-bullseye

# Install basic development tools
RUN apt update -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false && \
    apt install -y --no-install-recommends less git procps && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspaces/app

# Set ownership to node user for better security
RUN chown -R node:node /workspaces

# Switch to node user
USER node

# Expose port for Vite dev server
EXPOSE 8080
