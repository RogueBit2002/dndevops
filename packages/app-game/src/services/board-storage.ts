import { DrizzleService } from "@dndevops/backend-core/database";
import { BoardNotFoundError } from "@dndevops/domain/errors";
import { Principal, TeamID } from "@dndevops/domain/identity";
import { Effect } from "effect";
import { Board } from "@dndevops/domain/types";

export class BoardStorageService extends Effect.Service<BoardStorageService>()('@dndevops/app-game/BoardStorageService', {
	dependencies: [ ],
	effect: Effect.gen(function*() {
		
		const drizzle = yield* DrizzleService;

		return {
			boardExists: Effect.fn(function*(principal: Principal, id: string) {
				return false;
			}),
			createBoard: Effect.fn(function*(principal: Principal, team: TeamID) {

			}),
			deleteBoard: Effect.fn(function*(principal: Principal, id: string) {

			}),
			getBoard: Effect.fn(function*(principal: Principal, id: string) {
				
				if(true)
					return yield* new BoardNotFoundError;

				return { team: "", tiles: [], id: "" } as Board;
			}),
			getBoardsByTeam: Effect.fn(function*(principal: Principal, team: TeamID) {

				return [] as string[];
			})
		};
	})
}) {};