import { DrizzleService } from "@dndevops/backend-core/database";
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
import { Console, Effect, Either, Layer, Schema, flow, Config } from "effect"
import { createServer } from "node:http"

import { IdentityGroup,  } from "@dndevops/domain/api";

import { UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";
import { AuthenticationService } from "./services/auth";
import { TeamService } from "./services/team";
import { MailSender } from "@dndevops/backend-core";


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
);

const IsolatedApiLive = HttpApiBuilder.api(IsolatedApi).pipe(Layer.provide(identityGroupLive));


const mailLayer = Layer.effect(
	MailSender,
	Effect.gen(function*() {
		const uri = yield* Config.string("DNDEVOPS_SMTP_URI");
		const sender = yield* Config.string("DNDEVOPS_SMTP_SENDER");

		return yield* MailSender.make(uri, sender);
	})
);

import { migrate } from 'drizzle-orm/node-postgres/migrator';

const drizzleLayer = Layer.scoped(
	DrizzleService,
	Effect.gen(function*() {
		const uri = yield* Config.string("DNDEVOPS_IDENTITY_POSTGRES_URI");

		const service = yield* DrizzleService.make(uri);

		yield* service.use(async db => migrate(db, { migrationsFolder: "drizzle"}));

		return service;
	})
);

const appLayer = Layer.mergeAll(AuthenticationService.Default, TeamService.Default).pipe(
	Layer.provide(Layer.mergeAll(mailLayer, drizzleLayer)));

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
	
	Layer.provide(appLayer)
);



// Launch the server
Layer.launch(HttpLive).pipe(NodeRuntime.runMain);