import { DrizzleService } from "@dndevops/backend-core/database";
import { InvalidPermissionsError } from "@dndevops/domain/errors";
import { Principal, TeamID } from "@dndevops/domain/identity";
import { Inventory } from "@dndevops/domain/types";
import { Effect } from "effect";
import { inventoryTable } from "../db/schema";

export class InventoryService extends Effect.Service<InventoryService>()('@dndevops/app-game/InventoryService', {
	dependencies: [ ],
	effect: Effect.gen(function*() {
		
		const drizzle = yield* DrizzleService;

		return {
			ensureInventory: Effect.fn(function*(principal: Principal, team: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				yield* drizzle.use(async db => db.insert(inventoryTable).values({
					team,
					currency: 0
				}).onConflictDoNothing());
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