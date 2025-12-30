FROM alpine:3.23.0 AS base

RUN apk update && apk add nodejs


FROM base AS builder

RUN apk add pnpm

WORKDIR /workspace

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY tsconfig.root.json .
COPY packages packages
COPY scripts scripts


RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm -r --filter=@dndevops/app-* run build


FROM base AS runtime

RUN apk add caddy supervisor

WORKDIR /app

COPY --chmod=0755 images/packed/launcher.sh .
COPY images/packed/supervisord.conf .
COPY images/packed/Caddyfile .


COPY --from=builder /workspace/packages/app-frontend/dist packages/app-frontend/dist
COPY --from=builder /workspace/packages/app-frontend/package.json packages/app-frontend/package.json

COPY --from=builder /workspace/packages/app-identity/dist packages/app-identity/dist
COPY --from=builder /workspace/packages/app-identity/package.json packages/app-identity/package.json
COPY --from=builder /workspace/packages/app-identity/drizzle packages/app-identity/drizzle
COPY --from=builder /workspace/packages/app-identity/drizzle.config.ts packages/app-identity/drizzle.config.ts

COPY --from=builder /workspace/packages/app-game/dist packages/app-game/dist
COPY --from=builder /workspace/packages/app-game/package.json packages/app-game/package.json

COPY --from=builder /workspace/packages/app-events/dist packages/app-events/dist
COPY --from=builder /workspace/packages/app-events/package.json packages/app-events/package.json

# CMD ["/usr/bin/supervisord", "--configuration=/app/supervisord.conf"]
CMD [ "/app/launcher.sh" ]
