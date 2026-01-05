import { TeamIDSchema } from "@dndevops/domain/identity"
import { Schema } from "effect"

export class TeamCreatedEvent extends Schema.TaggedClass<TeamCreatedEvent>()("@dndevops/backend-core/TeamCreatedEvent", {
  id: Schema.String
}) {
  static readonly routingKey = "team.created" as const
  readonly routingKey = TeamCreatedEvent.routingKey;
}

export class TeamDeletedEvent extends Schema.TaggedClass<TeamDeletedEvent>()("@dndevops/backend-core/TeamDeletedEvent", {
  id: TeamIDSchema
}) {
  static readonly routingKey = "team.deleted" as const
  readonly routingKey = TeamDeletedEvent.routingKey;
}

export const Event = Schema.Union(TeamCreatedEvent, TeamDeletedEvent);
export type Event = typeof Event.Type;

export const Exchanges = {
	EVENTS: {
		name: "dndevops.events",
		type: "topic",
		durable: true
	}
} as const;

const x : TeamCreatedEvent = {} as unknown as TeamCreatedEvent;

x.routingKey;

