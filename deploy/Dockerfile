FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
        curl \
        ca-certificates \
        libssl3 \
    && rm -rf /var/lib/apt/lists/*

ARG GITHUB_REPO

WORKDIR /app

RUN set -e; \
    ASSETS=$(curl -fsSL \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/${GITHUB_REPO}/releases/latest"); \
    \
    BINARY_URL=$(echo "$ASSETS"   | grep -o '"browser_download_url": *"[^"]*portfolio-backend-linux-x86_64[^"]*"' | grep -o 'https://[^"]*'); \
    FRONTEND_URL=$(echo "$ASSETS" | grep -o '"browser_download_url": *"[^"]*frontend[^"]*"'                        | grep -o 'https://[^"]*'); \
    \
    curl -fsSL -L "$BINARY_URL"   | tar -xz; \
    curl -fsSL -L "$FRONTEND_URL" | tar -xz; \
    \
    chmod +x portfolio_backend

ENV serverPort=6767
ENV frontendDirPath=/app/frontend
ENV staticContentPath=/app/frontend/static/staticConfig.json

EXPOSE 6767

CMD ["./portfolio_backend"]
