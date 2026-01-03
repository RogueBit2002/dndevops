
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
	.handle("get-board", ({ request, urlParams }) => Effect.gen(function*() {
		
		const authInfo = yield* AuthenticationInfo;

		const boardStorage = yield* BoardStorageService;

		// All errors thrown are known by the API
		const board = yield* boardStorage.getBoard(authInfo.principal, urlParams.board);
		
		return board;
	}))
	.handle("get-inventory", ({ request, urlParams }) => Effect.gen(function*() {
		
		const authInfo = yield* AuthenticationInfo;

		const inventoryService = yield* InventoryService;

		const inventory = yield* inventoryService.getInventory(authInfo.principal, urlParams.team);

		return inventory;
	}))
);

export default HttpApiBuilder.api(IsolatedApi).pipe(Layer.provide(gameGroupLive));