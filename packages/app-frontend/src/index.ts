import { Effect } from "effect";
import { Api } from "@dndevops/domain/api";
import { FetchHttpClient, HttpApiClient } from "@effect/platform";

// Create a program that derives and uses the client
const program = Effect.gen(function*() {
  // Derive the client
  const client = yield* HttpApiClient.make(Api, {
    baseUrl: "http://localhost:3000"
  })
 
  //yield* client.Game["get-board"]({ })
  //yield* client.Identity["get-access-token"]({ headers: })
  return;
});
