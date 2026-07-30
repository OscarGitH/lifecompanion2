# syntax=docker/dockerfile:1

# =====================================================
# Stage — Base debian bullseye
# =====================================================
FROM debian:bookworm-slim AS base
LABEL project="lc"

# ---------- Common tools ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    wget \
    file \
    git \
    ca-certificates \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# ---------- Tauri / Linux GUI dependencies ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    libwebkit2gtk-4.1-dev \
    libgtk-3-dev \
    libglib2.0-dev \
    libgdk-pixbuf2.0-dev \
    libxdo-dev \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# =====================================================
# Stage — Node + PNPM
# =====================================================
FROM node:bookworm-slim AS node
LABEL project="lc"

RUN npm install -g pnpm@latest

# =====================================================
# Stage — Rust + Cargo + Tauri CLI
# =====================================================
FROM rust:slim-bookworm AS rust
LABEL project="lc"

RUN rustup component add rustfmt clippy
RUN cargo install tauri-cli

# =====================================================
# Stage — Dev environment
# =====================================================
FROM base AS dev
LABEL project="lc"

ARG USER=user
ARG UID=1000
ARG GID=1000

# ---------- User ----------
RUN groupadd -g ${GID} ${USER} \
    && useradd -m -u ${UID} -g ${GID} -s /bin/bash ${USER}

# ---------- Environment ----------
ENV USER_HOME=/home/${USER} \
    CARGO_HOME=/usr/local/cargo \
    RUSTUP_HOME=/usr/local/rustup

# ---------- Rust ----------
COPY --link --from=rust --chown=${USER}:${USER} /usr/local/cargo /usr/local/cargo
COPY --link --from=rust --chown=${USER}:${USER} /usr/local/rustup /usr/local/rustup
ENV PATH="${PATH}:/usr/local/cargo/bin"

# ---------- Node ----------
COPY --link --from=node --chown=${USER}:${USER} /usr/local/bin /usr/local/bin
COPY --link --from=node --chown=${USER}:${USER} /usr/local/lib/node_modules /usr/local/lib/node_modules

# ---------- Permissions ----------
RUN mkdir -p /app && chown -R ${USER}:${USER} /app

# ---------- Default entry & user ----------
USER ${USER}
WORKDIR /app
CMD ["/bin/bash"]

# =====================================================
# Stage — Android dev environment (~+10GB)
# =====================================================
FROM dev AS dev-android
LABEL project="lc"

USER root

# ---------- JDK ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# ---------- Android SDK + NDK ----------
COPY --link --from=cimg/android:2026.01-ndk --chown=${USER}:${USER} /home/circleci/android-sdk /opt/android-sdk

# ---------- Environment ----------
ENV ANDROID_HOME=/opt/android-sdk
ENV GRADLE_USER_HOME=/home/${USER}/.gradle
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN NDK_VERSION=$(ls -1 $ANDROID_HOME/ndk | sort -V | tail -n1) && \
    echo "NDK_HOME=$ANDROID_HOME/ndk/$NDK_VERSION" >> /etc/environment && \
    echo "export NDK_HOME=$ANDROID_HOME/ndk/$NDK_VERSION" > /etc/profile.d/ndk.sh

# ---------- Rust target ----------
RUN rustup target add aarch64-linux-android

# ---------- Permissions ----------
RUN mkdir -p ${GRADLE_USER_HOME} && chown -R ${USER}:${USER} ${GRADLE_USER_HOME}

USER ${USER}

# =====================================================
# Stage — Windows dev environment (MSVC cross-compile) (~+3GB)
# =====================================================
FROM dev AS dev-windows
LABEL project="lc"

USER root

# ---------- Windows msvc cross-build ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    llvm \
    clang \
    lld \
    nsis \
    && rm -rf /var/lib/apt/lists/*

# ---------- Rust target ----------
RUN rustup target add x86_64-pc-windows-msvc

# ---------- xwin install ----------
RUN cargo install xwin
RUN xwin --accept-license splat --output /opt/xwin

# ---------- Permissions ----------
RUN chown -R ${USER}:${USER} /opt/xwin

USER ${USER}
