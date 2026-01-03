import { DrizzleService } from "@dndevops/backend-core/database";
import { Principal, TeamID } from "@dndevops/domain/identity";
import { Inventory } from "@dndevops/domain/types";
import { Effect } from "effect";

export class InventoryService extends Effect.Service<InventoryService>()('@dndevops/app-game/InventoryService', {
	dependencies: [ ],
	effect: Effect.gen(function*() {
		
		const drizzle = yield* DrizzleService;

		return {
			createInventory: Effect.fn(function*(principal: Principal, id: TeamID) {
				
			}),
			deleteInventory: Effect.fn(function*(principal: Principal,id: TeamID) {

			}),
			inventoryExists: Effect.fn(function*(principal: Principal,id: TeamID) {

			}),
			getInventory: Effect.fn(function*(principal: Principal, team: TeamID) {
				return { team, currency: 0} as Inventory;
			}),
			modifyInventory: Effect.fn(function*(principal: Principal, id: string) {

			})
		};
	})
}) {};