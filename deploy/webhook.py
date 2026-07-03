#!/usr/bin/env python3

import hashlib
import hmac
import http.server
import json
import logging
import os
import subprocess
import threading

WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "").encode()
WEBHOOK_PORT   = int(os.environ.get("WEBHOOK_PORT", 9000))
GITHUB_REPO    = os.environ.get("GITHUB_REPO", "")
CONTAINER_NAME = os.environ.get("CONTAINER_NAME", "portfolio")
ENV_FILE       = os.environ.get("ENV_FILE", "/opt/portfolio/.env")
DEPLOY_DIR     = os.path.dirname(os.path.abspath(__file__))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


def verify_signature(body: bytes, signature: str) -> bool:
    if not WEBHOOK_SECRET:
        log.error("WEBHOOK_SECRET is not set — rejecting all requests")
        return False
    expected = "sha256=" + hmac.new(WEBHOOK_SECRET, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def run(cmd: list[str]) -> bool:
    log.info("$ %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        log.info(result.stdout.strip())
    if result.returncode != 0:
        log.error("command failed (exit %d):\n%s", result.returncode, result.stderr.strip())
        return False
    return True


def redeploy(tag: str = "latest"):
    log.info("=== redeployment started ===")

    image = f"{CONTAINER_NAME}-deploy"

    steps = [
        ["docker", "build",
            "--build-arg", f"GITHUB_REPO={GITHUB_REPO}",
            "--build-arg", f"RELEASE_TAG={tag}",
            "-t", image,
            DEPLOY_DIR],
        ["docker", "stop", CONTAINER_NAME],
        ["docker", "rm",   CONTAINER_NAME],
        ["docker", "run", "-d",
            "--name", CONTAINER_NAME,
            "--restart", "unless-stopped",
            "-p", "127.0.0.1:6767:6767",
            "--env-file", ENV_FILE,
            image],
    ]

    for cmd in steps:
        if not run(cmd):
            log.error("=== redeployment FAILED ===")
            return

    log.info("=== redeployment complete ===")


class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/webhook/release":
            self._respond(404, b"not found")
            return

        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)

        sig = self.headers.get("X-Hub-Signature-256", "")
        if not verify_signature(body, sig):
            log.warning("invalid signature from %s", self.client_address[0])
            self._respond(401, b"unauthorized")
            return

        if self.headers.get("X-GitHub-Event") != "release":
            self._respond(200, b"ignored")
            return

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self._respond(400, b"bad json")
            return

        if payload.get("action") != "published":
            self._respond(200, b"ignored")
            return

        tag = payload.get("release", {}).get("tag_name", "?")
        log.info("release %s published — scheduling redeploy", tag)

        self._respond(200, b"ok")
        threading.Thread(target=redeploy, args=(tag,), daemon=True).start()

    def _respond(self, status: int, body: bytes):
        self.send_response(status)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        log.debug("%s — " + fmt, self.client_address[0], *args)


if __name__ == "__main__":
    if not WEBHOOK_SECRET:
        log.warning("WEBHOOK_SECRET is empty — all webhook requests will be rejected")
    if not GITHUB_REPO:
        log.warning("GITHUB_REPO is empty — docker build arg will be blank")

    server = http.server.HTTPServer(("127.0.0.1", WEBHOOK_PORT), WebhookHandler)
    log.info("listening on 127.0.0.1:%d", WEBHOOK_PORT)
    server.serve_forever()
