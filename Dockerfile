FROM node:22.19.0-slim AS runtime

FROM node:22.19.0 AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /workspace
WORKDIR /workspace
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

# Deployables
FROM runtime AS dndevops-identity

COPY --from=builder /workspace/apps/identity/package.json /app/package.json
COPY --from=builder /workspace/apps/identity/dist /app/dist
WORKDIR /app
CMD [ "node", "." ]

FROM runtime AS dndevops-event-handler

COPY --from=builder /workspace/apps/event-handler/package.json /app/package.json
COPY --from=builder /workspace/apps/event-handler/dist /app/dist
WORKDIR /app
CMD [ "node", "." ]

FROM runtime AS dndevops-game

COPY --from=builder /workspace/apps/game/package.json /app/package.json
COPY --from=builder /workspace/apps/game/dist /app/dist
WORKDIR /app
CMD [ "node", "." ]

FROM runtime AS dndevops-frontend

COPY --from=builder /workspace/apps/frontend/package.json /app/package.json
COPY --from=builder /workspace/apps/frontend/dist /app/dist
WORKDIR /app
CMD [ "node", "." ]