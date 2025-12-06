import { Effect, Data, Context} from "effect";

import { Principal } from "@dndevops/library-identity";

import { InvalidPermissionsError } from "@dndevops/library-errors";

export class MissingUserError extends Data.TaggedError("MissingUserError")<{}> {}
export class MissingTeamError extends Data.TaggedError("MissingTeamError")<{}> {}
export class DuplicateUserError extends Data.TaggedError("DuplicateUserError")<{}> {}
export class DuplicateTeamError extends Data.TaggedError("DuplicationTeamTerror")<{}> {}

class IdentityStorageService extends Context.Tag("IdentityStorageService")<
	IdentityStorageService, 
	{
		readonly userExists: (email: string) => Effect.Effect<boolean>;
		
		readonly addRefreshKeyToUser: (email: string) => Effect.Effect<void>;
		//readonly createTeam: (id: string, displayName: string)

}>(){};
export class IdentityService extends Context.Tag("IdentityService")<
	IdentityService,
	{
		readonly sendRefreshToken: (email: string) => Effect.Effect<void, MissingUserError>;
		readonly getAccessToken: (refresh: string) => Effect.Effect<string>;
		readonly getRefreshToken: (email: string, nonce: string) => Effect.Effect<string, InvalidPermissionsError>;

		//readonly signMeOut: (email: string) => Effect.Effect<void, MissingUserError>;
		readonly createTeam: (p: Principal, id: string) => Effect.Effect<void, InvalidPermissionsError | DuplicateTeamError>;
		readonly deleteTeam: (p: Principal, id: string) => Effect.Effect<void, InvalidPermissionsError | MissingTeamError>;

		readonly assignUserToTeam: (p: Principal, user: string, team: string) => Effect.Effect<void, InvalidPermissionsError | MissingUserError | MissingTeamError>;
		readonly removeUserFromTeam: (p: Principal, user: string, team: string) => Effect.Effect<void, InvalidPermissionsError | MissingUserError | MissingTeamError>;
	}>() {
	static readonly Live = IdentityService.of({
		sendRefreshToken: (email: string) => Effect.gen(function* () {
			return yield* Effect.fail(new MissingUserError());
		}),
		getAccessToken: function (email: string): Effect.Effect<string> {
			throw new Error("Function not implemented.");
		},
		getRefreshToken: (email: string, nonce: string) => Effect.gen(function* () {
			return yield* Effect.fail(new InvalidPermissionsError());
		}),
		createTeam: function (p: Principal, id: string) {
			throw new Error("Function not implemented.");
		},
		deleteTeam: function (p: Principal, id: string) {
			throw new Error("Function not implemented.");
		},
		assignUserToTeam: function (p: Principal, user: string, team: string) {
			throw new Error("Function not implemented.");
		},
		removeUserFromTeam: function (p: Principal, user: string, team: string) {
			throw new Error("Function not implemented.");
		}
	});
};