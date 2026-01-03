import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiError,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSecurity,
  OpenApi
} from "@effect/platform";
import { Context, Schema } from "effect";

import { Principal, TeamDataSchema, TeamIDSchema } from "./identity";
import { BoardNotFoundError, InvalidPermissionsError, InventoryNotFoundError, TeamNotFoundError, UnauthorizedError, UserNotFoundError } from "./errors";
import { BoardIDSchema, BoardSchema, InventorySchema } from "./types";

const TokenHeaderSchema = Schema.Struct({
        authorization: Schema.String.pipe(Schema.filter((s) => s.startsWith("Bearer ") && s.length > "Bearer ".length))
});

export class AuthenticationInfo extends Context.Tag("@dndevops/backend-core/AuthenticationInfo")<AuthenticationInfo, {
	principal: Principal
}>() {};

export class AuthGatekeeper extends HttpApiMiddleware.Tag<AuthGatekeeper>()("@dndevops/backend-core/AuthGatekeeper", {
	failure: UnauthorizedError,
	provides: AuthenticationInfo,
	security: {
		auth: HttpApiSecurity.bearer
	}
}) {}


export const IdentityGroup = HttpApiGroup.make("Identity")
                .add(HttpApiEndpoint.get("get-access-token")`/access`
                        .addSuccess(Schema.String)
                        .addError(UnauthorizedError, { status: 401})
                        .setHeaders(Schema.Struct({
                                authorization: Schema.String.pipe(Schema.filter(s => s.startsWith("Bearer ")))
                        }))
                )
                .add(HttpApiEndpoint.get("get-refresh-token")`/refresh`
                        .addSuccess(Schema.String)
                        .addError(UnauthorizedError, { status: 401})
                        .setHeaders(Schema.Struct({
                                authorization: Schema.String.pipe(Schema.filter((s) => s.startsWith("Basic ")))
                        }))
                )
                .add(HttpApiEndpoint.post("send-refresh-request")`/refresh`
                        .addSuccess(Schema.Void)
                        .setPayload(Schema.Struct({ email: Schema.String }))
                        .addError(UserNotFoundError, { status: 404})
                )
                .add(HttpApiEndpoint.get("get-teams")`/teams`
					.addSuccess(Schema.Array(TeamIDSchema))
					.addError(UnauthorizedError, { status: 401 })
					.addError(InvalidPermissionsError, { status: 403 })
					.setHeaders(TokenHeaderSchema)
					.middleware(AuthGatekeeper))
				.add(HttpApiEndpoint.get("get-team")`/team/:team`
					.addSuccess(Schema.extend(TeamDataSchema, Schema.Struct({ id: TeamIDSchema })))
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(TeamNotFoundError, { status: 404})
					.setHeaders(TokenHeaderSchema)
					.middleware(AuthGatekeeper)
					.setUrlParams(Schema.Struct({ team: TeamIDSchema })))
				.add(HttpApiEndpoint.post("create-team")`/teams`
					.addSuccess(TeamIDSchema)
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.setHeaders(TokenHeaderSchema)
					.setPayload(TeamDataSchema.pipe(Schema.pick("displayName")))
					.middleware(AuthGatekeeper))
				.add(HttpApiEndpoint.del("delete-team")`/teams/:team`
					.addSuccess(Schema.Void)
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(TeamNotFoundError, { status: 404 })
					.setUrlParams(Schema.Struct({ team: TeamIDSchema }))
					.setHeaders(TokenHeaderSchema)
					.middleware(AuthGatekeeper)).prefix("/identity")
				.add(HttpApiEndpoint.post("update-team")`/teams/:team`
					.addSuccess(Schema.Void)
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(TeamNotFoundError, { status: 404 })
					.setHeaders(TokenHeaderSchema)
					.setUrlParams(Schema.Struct({ team: TeamIDSchema }))
					.setPayload(TeamDataSchema.pipe(Schema.pick("displayName")))
					.middleware(AuthGatekeeper))
				.add(HttpApiEndpoint.post("assign-to-team")`/teams/:team/users`
					.addSuccess(Schema.Void)
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(TeamNotFoundError, { status: 404 })
					.setHeaders(TokenHeaderSchema)
					.setUrlParams(Schema.Struct({ team: TeamIDSchema }))
					.setPayload(Schema.Struct({ email: Schema.String }))
					.middleware(AuthGatekeeper))
				.add(HttpApiEndpoint.post("remove-from-team")`/teams/:team/users/:user`
					.addSuccess(Schema.Void)
					.addError(UnauthorizedError, { status: 401})
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(TeamNotFoundError, { status: 404 })
					.setHeaders(TokenHeaderSchema)
					.setUrlParams(Schema.Struct({ team: TeamIDSchema, user: Schema.String }))
					.middleware(AuthGatekeeper)).prefix("/identity")
export const GameGroup = HttpApiGroup.make("Game")
                .add(HttpApiEndpoint.get("get-board")`/boards/:board`
					.addSuccess(BoardSchema)
					.addError(InvalidPermissionsError, {status: 403})
					.addError(BoardNotFoundError, { status: 404 })
					.setUrlParams(Schema.Struct({ board: BoardIDSchema }))
					.setHeaders(TokenHeaderSchema)
					.middleware(AuthGatekeeper))
                //.add(HttpApiEndpoint.post("manipulate-board")`/:team/board`.addSuccess(Schema.Void).setHeaders(DefaultAuthHeaderSchema))
                .add(HttpApiEndpoint.get("get-inventory")`/teams/:team/inventories`
					.addSuccess(InventorySchema)
					.addError(InvalidPermissionsError, { status: 403 })
					.addError(InventoryNotFoundError, { status: 404 })
					.setUrlParams(Schema.Struct({ team: TeamIDSchema }))
					.setHeaders(TokenHeaderSchema)
					.middleware(AuthGatekeeper))
				.prefix("/game");

export const EventGroup = HttpApiGroup.make("Events")
                .add(HttpApiEndpoint.post("publish-event")`/publish/:application`.addSuccess(Schema.Void).setHeaders(TokenHeaderSchema))
                .add(HttpApiEndpoint.get("get-keys")`/keys`.addSuccess(Schema.Array(Schema.String)).setHeaders(TokenHeaderSchema))
                .add(HttpApiEndpoint.put("create-key")`/keys`.addSuccess(Schema.Void).setHeaders(TokenHeaderSchema))
                .add(HttpApiEndpoint.del("delete-key")`/keys/:key`.addSuccess(Schema.Void).setHeaders(TokenHeaderSchema))
                .add(HttpApiEndpoint.put("update-routes")`/routes`.addSuccess(Schema.Void).setHeaders(TokenHeaderSchema)).prefix("/events");


export const Api = HttpApi.make("DnDevOps_API").add(IdentityGroup).add(GameGroup).add(EventGroup);
