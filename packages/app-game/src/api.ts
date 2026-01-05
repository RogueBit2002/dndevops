
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


import { AuthenticationInfo, GameGroup } from "@dndevops/domain/api";

import { UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";
import { BoardStorageService } from "./services/board-storage";
import { InventoryService } from "./services/inventory";

const IsolatedApi = HttpApi.make("DnDevOps-Game").add(GameGroup);


const gameGroupLive = HttpApiBuilder.group(IsolatedApi, "Game", (handlers) => handlers
	.handle("getBoard", ({ request, path }) => Effect.gen(function*() {
		
		const authInfo = yield* AuthenticationInfo;

		const boardStorage = yield* BoardStorageService;

		// All errors thrown are known by the API
		const board = yield* boardStorage.getBoard(authInfo.principal, path.team);
		
		return board;
	}))
	/*.handle("getBoardsByTeam", ({ request, path }) => Effect.gen(function*() {
		const authInfo = yield* AuthenticationInfo;

		const boardStorageService = yield* BoardStorageService;

		return yield* boardStorageService.getBoardsByTeam(authInfo.principal, path.team);
	}))*/
	.handle("getInventory", ({ request, path }) => Effect.gen(function*() {
		
		const authInfo = yield* AuthenticationInfo;

		const inventoryService = yield* InventoryService;

		const inventory = yield* inventoryService.getInventory(authInfo.principal, path.team);

		return inventory;
	}))
);

export default HttpApiBuilder.api(IsolatedApi).pipe(Layer.provide(gameGroupLive));