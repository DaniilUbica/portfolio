FROM ubuntu:24.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
        build-essential \
        cmake \
        python3 \
        python3-pip \
        libssl-dev \
        ca-certificates \
    && pip3 install conan --break-system-packages \
    && rm -rf /var/lib/apt/lists/*

RUN conan profile detect --force

WORKDIR /src

COPY backend/conanfile.txt ./backend/
WORKDIR /src/backend

RUN conan install . \
        --output-folder=build \
        --build=missing \
        -s build_type=Release \
        -s compiler.cppstd=20

COPY backend/ ./
COPY frontend/ /src/frontend/

RUN cmake -B build \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake \
    && cmake --build build --config Release -j"$(nproc)"

FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
        libssl3 \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /src/backend/build/portfolio_backend ./portfolio_backend
COPY --from=builder /src/backend/build/frontend           ./frontend
COPY staticConfig.json                                    ./staticConfig.json

ENV serverPort=6767
ENV frontendDirPath=/app/frontend
ENV staticContentPath=/app/staticConfig.json

EXPOSE 6767

CMD ["./portfolio_backend"]
