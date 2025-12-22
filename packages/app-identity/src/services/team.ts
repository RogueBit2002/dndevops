import { DrizzleService } from "@dndevops/backend-core/database";
import { Context, Effect } from "effect";
import { TeamID, Principal } from "@dndevops/domain/identity";


export class TeamService extends Effect.Service<TeamService>()('Aaa', {
	effect: Effect.gen(function*() {
		const drizzle = yield* DrizzleService;
		
		return {
			getTeams: Effect.fn(function*() {
				return [] as TeamID[];
			}),

			getTeam: Effect.fn(function*(id: TeamID) {
				return { };
			}),

			createTeam: Effect.fn(function*(principal: Principal, displayName: string) {
				return "" as TeamID;
			}),

			deleteTeam: Effect.fn(function*(id: TeamID) {

			}),

			updateTeam: Effect.fn(function*(displayName: string) {

			}),
			
			assignUserToTeam: Effect.fn(function*(team: TeamID, user: string) {

			}),

			removeUserFromTeam: Effect.fn(function*(team: TeamID, user: string) {

			}),
		};
	})
}){};


TeamService.Default