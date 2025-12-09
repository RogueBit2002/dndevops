import { Effect, flow } from "effect";
import { FetchHttpClient, HttpApiClient, HttpClient, HttpClientRequest } from "@effect/platform";
import { Api } from "@dndevops/library-public-api";

const url = "http://localhost/api";

export class ApiClient extends Effect.Service<ApiClient>()("@dndevops/ApiClient", {
	dependencies: [ FetchHttpClient.layer ],
	effect: HttpApiClient.make(Api, {
		baseUrl: url,
		transformClient: (client) => client.pipe(
			HttpClient.mapRequest((request) => {
				
				console.log(request.url);
				return request;
			})
		)
	})
}) {};

const program = Effect.gen(function* () {
	const client = yield* ApiClient;

	const a = yield* client.Identity["send-refresh-request"]();
});

await Effect.runPromise(program.pipe(Effect.provide(ApiClient.Default)));

//Effect.runSync(program.pipe(Effect.provideService(ApiClient, ApiClient.Default)));