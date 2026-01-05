#!/bin/sh

DNDEVOPS_RUN_IDENTITY=false
DNDEVOPS_RUN_GAME=false
DNDEVOPS_RUN_EVENTS=false
DNDEVOPS_RUN_FRONTEND=false

case "$DNDEVOPS_DEPLOYMENT" in
  all)
    DNDEVOPS_RUN_IDENTITY=true
    DNDEVOPS_RUN_GAME=true
    DNDEVOPS_RUN_EVENTS=true
    DNDEVOPS_RUN_FRONTEND=true
    ;;
  identity) DNDEVOPS_RUN_IDENTITY=true ;;
  game) DNDEVOPS_RUN_GAME=true ;;
  events) DNDEVOPS_RUN_EVENTS=true ;;
  frontend) DNDEVOPS_RUN_FRONTEND=true ;;
  *) echo "No deployment role was specified. Options: all, identity, game, events, frontend" && exit 1;;
esac

[ "$DNDEVOPS_RUN_IDENTITY" = "false" ] && [ -z "$DNDEVOPS_IDENTITY_POSTGRES_URI" ] && export DNDEVOPS_IDENTITY_POSTGRES_URI="undefined"
[ "$DNDEVOPS_RUN_GAME" = "false" ] && [ -z "$DNDEVOPS_GAME_POSTGRES_URI" ] && export DNDEVOPS_GAME_POSTGRES_URI="undefined"
[ "$DNDEVOPS_RUN_EVENTS" = "false" ] && [ -z "$DNDEVOPS_EVENTS_POSTGRES_URI" ] && export DNDEVOPS_EVENTS_POSTGRES_URI="undefined"

export DNDEVOPS_RUN_IDENTITY
export DNDEVOPS_RUN_GAME
export DNDEVOPS_RUN_EVENTS
export DNDEVOPS_RUN_FRONTEND

exec supervisord --configuration=./supervisord.conf
