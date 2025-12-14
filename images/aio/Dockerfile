FROM ubuntu:25.10 AS base

RUN apt update && apt install -y nodejs npm iputils-ping wget


FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global corepack@latest
RUN corepack enable pnpm

WORKDIR /workspace

COPY packages packages
COPY package.json package.json
COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY tsconfig.root.json tsconfig.root.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm -r --filter=@dndevops/app-* run build


FROM base AS runtime

# Caddy


RUN wget https://github.com/caddyserver/caddy/releases/download/v2.10.2/caddy_2.10.2_linux_amd64.deb && dpkg -i caddy_2.10.2_linux_amd64.deb

RUN apt install -y supervisor
# RUN systemctl stop --now caddy && systemctl disable --now caddy

RUN mkdir -p /var/log/supervisor

WORKDIR /app

COPY --from=builder /workspace/packages/app-frontend/dist packages/app-frontend/dist
COPY --from=builder /workspace/packages/app-frontend/package.json packages/app-frontend/package.json

COPY --from=builder /workspace/packages/app-identity/dist packages/app-identity/dist
COPY --from=builder /workspace/packages/app-identity/package.json packages/app-identity/package.json

COPY --from=builder /workspace/packages/app-game/dist packages/app-game/dist
COPY --from=builder /workspace/packages/app-game/package.json packages/app-game/package.json

COPY --from=builder /workspace/packages/app-events/dist packages/app-events/dist
COPY --from=builder /workspace/packages/app-events/package.json packages/app-events/package.json

COPY images/aio/supervisord.conf supervisord.conf
COPY images/aio/Caddyfile Caddyfile

CMD ["/usr/bin/supervisord", "--configuration=/app/supervisord.conf"]