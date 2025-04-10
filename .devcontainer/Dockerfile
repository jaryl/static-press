FROM node:20-bullseye

# Install basic development tools
RUN apt update -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false && apt install -y less git procps

# Install Bun (since bun.lockb is present in the project)
RUN curl -fsSL https://bun.sh/install | bash

# Ensure bun is available in PATH
ENV PATH="/root/.bun/bin:${PATH}"
ENV PATH="/home/node/.bun/bin:${PATH}"

# Set working directory
WORKDIR /workspaces/app

# Set ownership to node user for better security
RUN chown -R node:node /workspaces

# Switch to node user
USER node

# Expose port for Vite dev server
EXPOSE 8080
