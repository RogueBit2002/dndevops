import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  OpenApi
} from "@effect/platform";
import { Schema } from "effect";

import { } from "./identity";
import { UnauthorizedError, UserNotFoundError } from "./errors";

const DefaultAuthHeaderSchema = Schema.Struct({
	Authorization: Schema.String.pipe(Schema.filter((s) => s.startsWith("Bearer ") && s.length > "Bearer ".length))
});

export const IdentityGroup = HttpApiGroup.make("Identity")
		.add(HttpApiEndpoint.get("get-access-token")`/access`
			.addSuccess(Schema.String)
			.addError(UnauthorizedError, { status: 401})
			.setHeaders(Schema.Struct({
				Authorization: Schema.String.pipe(Schema.filter(s => s.startsWith("Bearer ")))
			}))
		)
		.add(HttpApiEndpoint.get("get-refresh-token")`/refresh`
			.addSuccess(Schema.String)
			.addError(UnauthorizedError, { status: 401})
			.setHeaders(Schema.Struct({
				Authorization: Schema.String.pipe(Schema.filter((s) => s.startsWith("Basic ")))
			}))
		)
		.add(HttpApiEndpoint.post("send-refresh-request")`/refresh`
			.addSuccess(Schema.Void)
			.setPayload(Schema.Struct({ email: Schema.String }))
			.addError(UserNotFoundError, { status: 404})
		).prefix("/identity");

		/*.add(HttpApiEndpoint.get("get-teams")`/teams`.addSuccess(Schema.Void)) // Assignment check
		.add(HttpApiEndpoint.get("get-team")`/teams/:team`.addSuccess(Schema.Void)) // Assignment check
		.add(HttpApiEndpoint.post("create-team")`/teams`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.del("delete-team")`/teams/:team`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.put("update-team")`/teams/:team`.addSuccess(Schema.Void))*/

export const GameGroup = HttpApiGroup.make("Game")
		.add(HttpApiEndpoint.get("get-board")`/:team/board`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
		//.add(HttpApiEndpoint.post("manipulate-board")`/:team/board`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
		.add(HttpApiEndpoint.get("get-state")`/:team/state`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema)).prefix("/game");
		
export const EventGroup = HttpApiGroup.make("Events")
		.add(HttpApiEndpoint.post("publish-event")`/publish/:application`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
		.add(HttpApiEndpoint.get("get-keys")`/keys`.addSuccess(Schema.Array(Schema.String)).setHeaders(DefaultAuthHeaderSchema))
		.add(HttpApiEndpoint.put("create-key")`/keys`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
		.add(HttpApiEndpoint.del("delete-key")`/keys/:key`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
		.add(HttpApiEndpoint.put("update-routes")`/routes`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema)).prefix("/events");


export const Api = HttpApi.make("DnDevOps_API").add(IdentityGroup).add(GameGroup).add(EventGroup);