FROM node:25.2.1 AS runtime

RUN apt-get update && \
    apt-get install -y iputils-ping
    
FROM node:25.2.1 AS builder



# RUN nix-channel --update
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
#RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.24.0 sh -
#ENV PNPM_HOME="/root/.local/share/pnpm"
#ENV PATH="$PNPM_HOME:$PATH"
# RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
# RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
# RUN corepack enable

# RUN nix-env --install --attr nixpkgs.pnpm
# RUN nix-env --install --attr nixpkgs.nodejs_22

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

FROM runtime AS dndevops-events

COPY --from=builder /workspace/apps/events/package.json /app/package.json
COPY --from=builder /workspace/apps/events/dist /app/dist
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