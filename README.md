# portfolio

Personal portfolio website with a C++20 backend and a vanilla JS frontend styled as a memory dump terminal.

Live at [daniilubica.lol](https://daniilubica.lol)

be careful... frontend is vibecoded

## Stack

**Backend** — C++20, [cpp-httplib](https://github.com/yhirose/cpp-httplib)
**Frontend** — HTML, CSS, JS  
**Infrastructure** — Docker, GitHub Actions, nginx

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
├── data/             # Content and assets served via API
│   ├── staticConfig.json  # Site content (bio, experience, skills, socials)
│   └── cv.pdf
├── frontend/         # Static frontend
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── admin.html
│   └── error.html
├── deploy/           # Server deployment
│   ├── Dockerfile    # Pulls latest release artifacts from GitHub
│   ├── start.sh      # Builds image, starts container, sets up webhook service
│   ├── webhook.py    # GitHub webhook listener — redeploys on new release
│   └── .env.example
└── .github/
    └── workflows/
        └── ci.yml    # Build, test, release
```

## Configuration

All configuration is done via environment variables. See `deploy/.env.example`:

```env
serverPort=6767
frontendDirPath=/app/frontend
staticContentPath=/app/data/staticConfig.json
cvPath=/app/data/cv.pdf
githubUsername=your_username
githubToken=ghp_...
adminPassword=your_admin_password

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
