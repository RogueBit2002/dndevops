import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  OpenApi
} from "@effect/platform";
import { Schema } from "effect";

const DefaultAuthHeaderSchema = Schema.Struct({
	Authorization: Schema.String.pipe(Schema.filter((s) => s.startsWith("Bearer ") && s.length > "Bearer ".length))
});

const UnauthHeaderSchema = Schema.Struct({
	Authoriztion: Schema.String.pipe(Schema.filter((s) => s.startsWith("Basic ") && s.length > "Basic ".length))
});

export const IdentityGroup = HttpApiGroup.make("Identity")
		.add(HttpApiEndpoint.get("get-access-token")`/identity/access`.addSuccess(Schema.String))
		.add(HttpApiEndpoint.get("get-refresh-token")`/identity/refresh`.addSuccess(Schema.String))
		.add(HttpApiEndpoint.post("send-refresh-request")`/identity/refresh`.addSuccess(Schema.Void))

		/*.add(HttpApiEndpoint.get("get-teams")`/teams`.addSuccess(Schema.Void)) // Assignment check
		.add(HttpApiEndpoint.get("get-team")`/teams/:team`.addSuccess(Schema.Void)) // Assignment check
		.add(HttpApiEndpoint.post("create-team")`/teams`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.del("delete-team")`/teams/:team`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.put("update-team")`/teams/:team`.addSuccess(Schema.Void))*/

export const GameGroup = HttpApiGroup.make("Game")
		.add(HttpApiEndpoint.get("get-board")`/game/:team/board`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.post("manipulate-board")`/game/:team/board`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.get("get-state")`/game/:team/state`.addSuccess(Schema.Void));
export const EventGroup = HttpApiGroup.make("Events")
		.add(HttpApiEndpoint.post("publish-event")`/events/publish/:application`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.get("get-keys")`/events/keys`.addSuccess(Schema.String))
		.add(HttpApiEndpoint.put("create-key")`/events/keys`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.del("delete-key")`/events/keys/:key`.addSuccess(Schema.Void))
		.add(HttpApiEndpoint.put("update-routes")`/events/routes`.addSuccess(Schema.Void));


export const CompiteApi = HttpApi.make("DnDevOps_API").add(IdentityGroup).add(GameGroup).add(EventGroup);
