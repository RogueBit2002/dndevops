
import { Console, Effect, Either, Layer, Schema, flow, Config } from "effect";
import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiError,
	HttpApiGroup,
	HttpMiddleware,
	HttpServer
} from "@effect/platform";


import { AuthenticationInfo, IdentityGroup,  } from "@dndevops/domain/api";

import { UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";
import { AuthenticationService } from "./services/auth";
import { TeamService } from "./services/team";

const IsolatedApi = HttpApi.make("DnDevOps-Identity").add(IdentityGroup);


const identityGroupLive = HttpApiBuilder.group(IsolatedApi, "Identity", (handlers) => handlers
	.handle("get-access-token", ({ request, headers }) => Effect.gen(function*() {
		const authService = yield* AuthenticationService;

		const refreshToken = headers.authorization.substring("Bearer ".length);

		const result = yield* Effect.either(authService.getAccessToken(refreshToken));

		if(Either.isRight(result))
			return result.right;

		return yield* new UnauthorizedError;
	}))
	.handle("get-refresh-token", ({ request, headers }) => Effect.gen(function*() {

		const authService = yield* AuthenticationService;

		const encoded = headers.authorization.substring("Basic ".length);

		console.log(encoded);
		const decoded = atob(encoded);

		
		console.log(decoded);
		const [ email, code ] = decoded.split(":");

		console.log(`email: ${email} || code: ${code}`);

		if(email == undefined || code == undefined)
			return yield*  new UnauthorizedError;

		
		const either = yield* Effect.either(authService.getRefreshToken(email, code));

		//Wtf is going on?? left is right and right is left????
		if(Either.isRight(either))
			return either.right;


		return yield* new UnauthorizedError;
	}))
	.handle("send-refresh-request", ({ request, payload }) => Effect.gen(function*() {
		const authService = yield* AuthenticationService;

		const result = yield* Effect.either(authService.requestRefreshToken(payload.email));

		if(Either.isLeft(result))
			return yield* new UserNotFoundError;
	}))
	.handle("get-teams", ({ request,  }) => Effect.gen(function*() {
		const info = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		return yield* teamService.getTeams(info.principal);
	}))
	.handle("get-team", ({ request, urlParams }) => Effect.gen(function*() {

		console.log(urlParams.team);

		const info = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		return yield* teamService.getTeam(info.principal, urlParams.team);
	}))
	.handle("create-team", ({ request, payload}) => Effect.gen(function*() {

		const authInfo = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		const id = yield* teamService.createTeam(authInfo.principal, payload.displayName);
		return id;
	}))
	.handle("delete-team", ({ request, urlParams}) => Effect.gen(function*() {
		const authInfo = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		yield* teamService.deleteTeam(authInfo.principal, urlParams.team);
	}))
	.handle("update-team", ({ request, urlParams, payload}) => Effect.gen(function*() {
		const authInfo = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		yield* teamService.updateTeam(authInfo.principal, urlParams.team, payload.displayName);
	}))
	.handle("assign-to-team", ({ request, urlParams, payload}) => Effect.gen(function*() {
		const authInfo = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		yield* teamService.assignUserToTeam(authInfo.principal, urlParams.team, payload.email);
	}))
	.handle("remove-from-team", ({ request, urlParams }) => Effect.gen(function*() {
		const authInfo = yield* AuthenticationInfo;

		const teamService = yield* TeamService;

		yield* teamService.removeUserFromTeam(authInfo.principal, urlParams.team, urlParams.user);
	}))

);

export default HttpApiBuilder.api(IsolatedApi).pipe(Layer.provide(identityGroupLive));