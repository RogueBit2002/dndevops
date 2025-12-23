import { DrizzleService } from "@dndevops/backend-core/database";
import { Context, Effect } from "effect";
import { TeamID, Principal, TeamData } from "@dndevops/domain/identity";
import { InvalidPermissionsError, TeamNotFoundError } from "@dndevops/domain/errors";

import { teamMemberTable, teamTable } from "../db/schema";
import { and, eq } from "drizzle-orm/pg-core/expressions";
import * as uuid from "uuid";

export class TeamService extends Effect.Service<TeamService>()('Aaa', {
	effect: Effect.gen(function*() {
		const drizzle = yield* DrizzleService;
		
		return {
			getTeams: Effect.fn(function*() {
				const teams = yield* drizzle.use(async db => db.select().from(teamTable))
				return teams.map(t => t.id);
			}),

			getTeam: Effect.fn(function*(id: TeamID) {
				const [teamData] = yield* drizzle.use(async db => db.select().from(teamTable).where(eq(teamTable.id, id)));

				if(!teamData)
					return yield* new TeamNotFoundError;

				const members = yield* drizzle.use(async db => db.select().from(teamMemberTable).where(eq(teamTable.id, id)));

				return { 
					id,
					displayName: teamData.name,
					members: members.map(m => m.email)
				} as TeamData & {id: TeamID};
			}),

			createTeam: Effect.fn(function*(principal: Principal, displayName: string) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				const id = uuid.v4();
				
				yield* drizzle.use(async db => db.insert(teamTable).values({ id, name: displayName }));

				return id;
			}),

			deleteTeam: Effect.fn(function*(principal: Principal, id: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				const rows = yield* drizzle.use(async db => db.delete(teamTable).where(eq(teamTable.id, id)).returning());

				if(rows.length == 0)
					return yield* new TeamNotFoundError;
			}),

			updateTeam: Effect.fn(function*(principal: Principal, id: TeamID, displayName: string) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				const change = yield* drizzle.use(async db => db.update(teamTable).set({ name: displayName }).where(eq(teamTable.id, id)));

				if(change.rowCount ?? 0 == 0)
					return yield* new TeamNotFoundError;
			}),
			
			assignUserToTeam: Effect.fn(function*(principal: Principal, team: TeamID, email: string) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				const exists = (yield* drizzle.use(async db => db.select().from(teamTable).where(eq(teamTable.id, team)))).length > 0;

				if(!exists)
					return yield* new TeamNotFoundError;

				// Just ignore double assignments, it's fine
				yield* drizzle.use(async db => db.insert(teamMemberTable).values({ email, id: team }).onConflictDoNothing());
			}),

			removeUserFromTeam: Effect.fn(function*(principal: Principal, team: TeamID, email: string) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				yield* drizzle.use(async db => db.delete(teamMemberTable).where(and(eq(teamMemberTable.email, email), eq(teamMemberTable.id, team))));
			}),
		};
	})
}){};