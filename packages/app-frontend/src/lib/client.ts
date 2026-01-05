import { DateTime, Effect, Either } from "effect";
import { Api } from "@dndevops/domain/api";
import { FetchHttpClient, HttpApiClient, HttpApiSecurity, HttpClient } from "@effect/platform";

export class ApiClient extends Effect.Service<ApiClient>()("@dndevops/app-frontend/ApiClient", {
	dependencies: [ FetchHttpClient.layer ],
	effect: Effect.gen(function*() {

		// TODO: Change this to be dynamic/build time
		const url = "http://localhost:8000/api";

		const client = yield* HttpApiClient.make(Api, {
			baseUrl: url
		});

		return client;
	})
}){};

export class AutomatedAccessToken extends Effect.Tag("@dndevops/app-frontend/AutomatedAccessToken")<AutomatedAccessToken, {
	accessToken: Effect.Effect<string, never, never>
}>(){
	static readonly make = Effect.fnUntraced(function*(initialRefreshToken: string, onRefreshTokenFailure: () => void, storeRefreshToken: (token: string) => void) {
		const client = yield* ApiClient;

		let refreshToken = initialRefreshToken;

		let _accessToken: string | undefined;
		let expiration: number = 0;
		
		return AutomatedAccessToken.of({
			accessToken: Effect.gen(function*() {
				const now = yield* DateTime.now;

				if(_accessToken) {
					const delta = expiration - (now.epochMillis / 1000);

					// Return the cached refresh token if it's still valid for 2 or more minutes
					if(delta > 120) 
						return _accessToken;
				}

				const either = yield* Effect.either(client.Identity.getAccessToken({ headers: { authorization: refreshToken }}));

				if(Either.isLeft(either))
				{
					onRefreshTokenFailure();
					yield* Effect.die("Invalid access token response"); // Should be unreachable but it's still cleaner
					throw "Automated access token failure"
				}

				
				refreshToken = either.right.refreshToken;
				_accessToken = either.right.accessToken;

				expiration = (JSON.parse(either.right.accessToken.split(".")[1]) as { exp: number }).exp;
				return _accessToken;
			})
		});
	})
}