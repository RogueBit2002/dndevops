import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiError,
	HttpApiGroup,
	HttpMiddleware,
	HttpServer
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Console, Effect, Either, Layer, Schema, flow } from "effect"
import { createServer } from "node:http"

import { IdentityGroup,  } from "@dndevops/library-domain/api";

import { IdentityService } from "@dndevops/module-identity";
import { UnauthorizedError, UserNotFoundError } from "@dndevops/library-domain/errors";


const IsolatedApi = HttpApi.make("DnDevOps-Identity").add(IdentityGroup);


const identityGroupLive = HttpApiBuilder.group(IsolatedApi, "Identity", (handlers) => handlers
	.handle("get-access-token", ({ request, headers }) => Effect.gen(function*() {
		const identity = yield* IdentityService;

		const refreshToken = headers.Authorization.substring("Bearer ".length);

		const result = yield* Effect.either(identity.getAccessToken(refreshToken));

		if(Either.isRight(result))
			return result.right;

		return yield* new UnauthorizedError;
	}))
	.handle("get-refresh-token", ({ request, headers }) => Effect.gen(function*() {
		const identity = yield* IdentityService;

		const encoded = headers.Authorization.substring("Basic ".length);

		const decoded = btoa(encoded);

		const [ email, nonce ] = decoded.split(":");

		if(email == undefined || nonce == undefined)
			return yield*  new UnauthorizedError;

		const either = yield* Effect.either(identity.getRefreshToken(email, nonce));

		//Wtf is going on?? left is right and right is left????
		if(Either.isRight(either))
			return either.right;

		return yield* new UnauthorizedError;
	}))
	.handle("send-refresh-request", ({ request, payload }) => Effect.gen(function*() {
		const identity = yield* IdentityService;

		const result = yield* Effect.either(identity.requestRefreshToken(payload.email));

		if(Either.isLeft(result))
			return yield* new UserNotFoundError;
	}))
);

const IsolatedApiLive = HttpApiBuilder.api(IsolatedApi).pipe(Layer.provide(identityGroupLive));

// Configure and serve the API
const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
	// Add CORS middleware to handle cross-origin requests
	Layer.provide(HttpApiBuilder.middlewareCors()),
	// Provide the API implementation
	Layer.provide(IsolatedApiLive),
	// Log the server's listening address
	HttpServer.withLogAddress,
	// Set up the Node.js HTTP server
	Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
	
	Layer.provide(IdentityService.Default)
);


// Launch the server
Layer.launch(HttpLive).pipe(NodeRuntime.runMain);