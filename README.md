# portfolio

Personal portfolio website with a C++20 backend and a vanilla JS frontend styled as a memory dump terminal.

Live at [daniilubica.lol](https://daniilubica.lol)

## Stack

**Backend** — C++20, [cpp-httplib](https://github.com/yhirose/cpp-httplib), [nlohmann/json](https://github.com/nlohmann/nlohmann_json), Conan, CMake  
**Frontend** — HTML, CSS, JS  
**Infrastructure** — Docker, GitHub Actions, nginx, Let's Encrypt

## Project structure

```
portfolio/
├── backend/          # C++ backend
│   ├── src/
│   │   ├── config/         # Environment config reader
│   │   ├── server/         # httplib wrapper, route registration
│   │   ├── router/         # Route handlers
│   │   ├── contentLoader/  # Reads staticConfig.json, caches content
│   │   └── githubClient/   # GitHub GraphQL API client
│   ├── Dockerfile
│   └── CMakeLists.txt
├── frontend/         # Static frontend
│   ├── css/
│   ├── js/
│   ├── static/       # Static assets (cv.pdf, staticConfig.json)
│   ├── index.html
│   └── error.html
├── deploy/           # VPS deployment
│   ├── Dockerfile    # Pulls latest release artifacts from GitHub
│   ├── start.sh      # Builds image, starts container, sets up webhook service
│   ├── webhook.py    # GitHub webhook listener — redeploys on new release
│   └── .env.example
└── .github/
    └── workflows/
        └── ci.yml    # Build, test, release
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Main page |
| GET | `/api/content` | Site content from `staticConfig.json` |
| GET | `/api/repos` | Pinned GitHub repositories via GraphQL |
| POST | `/api/content/reload` | Reload content from disk |

`/api/*` routes require `Content-Type: application/json`. Browser navigation to API endpoints redirects to the error page.

## Configuration

All configuration is done via environment variables. See `deploy/.env.example`:

```env
serverPort=6767
frontendDirPath=/app/frontend
staticContentPath=/app/frontend/static/staticConfig.json
githubUsername=your_username
githubToken=ghp_...

GITHUB_REPO=username/portfolio
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_PORT=9000
CONTAINER_NAME=portfolio
```

## Local development

**Requirements:** C++20 compiler, CMake, Conan 2

```bash
cd backend
conan install . --output-folder=build --build=missing
cmake -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release
cmake --build build
./build/portfolio_backend
```

The server starts on port `6767` by default. Frontend is served as static files from `frontendDirPath`.

## Deployment

Deployment is fully automated via GitHub Actions and a webhook listener on the VPS.

**On push to `master`** — builds a Docker image.  
**On new tag `v*`** — creates a GitHub Release with the binary and frontend archive.  
**On release published** — GitHub sends a webhook to the VPS, which rebuilds the Docker image from the new release artifacts and restarts the container.

### First-time setup on VPS

```bash
git clone https://github.com/DaniilUbica/portfolio /root/repos/portfolio
cp /root/repos/portfolio/deploy/.env.example /root/repos/portfolio/.env
# fill in .env with real values
cd /root/repos/portfolio/deploy && ./start.sh
```

`start.sh` builds the Docker image, starts the container, and registers the webhook listener as a systemd service.

### nginx

```nginx
server {
    listen 80;
    server_name daniilubica.lol www.daniilubica.lol;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name daniilubica.lol www.daniilubica.lol;

    ssl_certificate     /etc/ssl/daniilubica.lol/cert.pem;
    ssl_certificate_key /etc/ssl/daniilubica.lol/key.pem;

    location / {
        proxy_pass http://127.0.0.1:6767;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /webhook/release {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
