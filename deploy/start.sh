#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ENV_FILE="${ENV_FILE:-/opt/portfolio/.env}"
CONTAINER_NAME="${CONTAINER_NAME:-portfolio}"
GITHUB_REPO="${GITHUB_REPO:-DaniilUbica/portfolio}"
WEBHOOK_PORT="${WEBHOOK_PORT:-9000}"

if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "[start.sh] ERROR: env file not found: $ENV_FILE" >&2
    exit 1
fi

echo "[start.sh] Building deploy image..."
docker build \
    --build-arg "GITHUB_REPO=${GITHUB_REPO}" \
    -t "${CONTAINER_NAME}-deploy" \
    "$SCRIPT_DIR"

echo "[start.sh] Starting container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm   "$CONTAINER_NAME" 2>/dev/null || true

docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p 127.0.0.1:6767:6767 \
    --env-file "$ENV_FILE" \
    "${CONTAINER_NAME}-deploy"

echo "[start.sh] Container started."

echo "[start.sh] Setting up webhook systemd service..."

SERVICE_FILE="/etc/systemd/system/${CONTAINER_NAME}-webhook.service"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Portfolio webhook listener
After=network.target

[Service]
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/python3 ${SCRIPT_DIR}/webhook.py
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable  "${CONTAINER_NAME}-webhook"
systemctl restart "${CONTAINER_NAME}-webhook"

echo "[start.sh] Webhook service started."
