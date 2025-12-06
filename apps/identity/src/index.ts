import {
	HttpApi,
	HttpApiBuilder,
	HttpApiEndpoint,
	HttpApiGroup,
	HttpMiddleware,
	HttpServer
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Console, Effect, Layer, Schema } from "effect"
import { createServer } from "node:http"

import { IdentityGroup,  } from "@dndevops/library-public-api";

import { IdentityService } from "@dndevops/module-identity";


import { createTransport } from "nodemailer";
const IsolatedApi = HttpApi.make("DnDevOps-Identity").add(IdentityGroup);


const mailer = createTransport({
	host: "localhost",
	port: 1025 ,
	secure: false, // true for 465, false for other ports
	auth: {
		user: "login@doesnt.matter",
		pass: "beepboop",
	},
});

await mailer.sendMail({
	from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
	to: "bar@example.com, baz@example.com",
	subject: "Hello ✔",
	text: "Hello world?", // plain‑text body
	html: "<b>Hello world?</b>", // HTML body
});


const identityGroupLive = HttpApiBuilder.group(IsolatedApi, "Identity", (handlers) => handlers
	.handle("get-access-token", () => Effect.gen(function*() {
		//const x = yield* IdentityService.Live.getAccessToken("Hi!");
		return "Hey!";
	}))
	.handle("get-refresh-token", ({ request }) => Effect.gen(function*() {
		yield* Console.log(request.headers);
		return "Hi!";
	}))
	.handle("send-refresh-request", () => Effect.gen(function*() {
		return;
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
	Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
);

// Launch the server
Layer.launch(HttpLive).pipe(NodeRuntime.runMain);