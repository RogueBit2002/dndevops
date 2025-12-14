import * as PgClient from "@effect/sql-pg/PgClient";

import { Data, Effect, Context, Random, DateTime, Layer, Redacted, Schedule, Duration } from "effect";

import { createTransport } from "nodemailer";

import * as jwt from "jsonwebtoken";
import { SqlClient } from "@effect/sql";


import { Principal } from "@dndevops/domain/identity";
import { UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";

export class DuplicateUserError extends Data.TaggedError("DuplicateUserError")<{}> {};
export class DuplicateTeamError extends Data.TaggedError("DuplicationTeamTerror")<{}> {};

let _nonce: string | undefined = undefined;


const PgLive = Layer.unwrapEffect(
	Effect.gen(function*() {
		return PgClient.layer({
			url: Redacted.make("dndevops-identity-db"),
		})
	})
).pipe((self) =>
  Layer.retry(
    self,
    Schedule.identity<Layer.Layer.Error<typeof self>>().pipe(
      Schedule.check((input) => input._tag === "SqlError"),
      Schedule.intersect(Schedule.exponential("1 second")),
      Schedule.intersect(Schedule.recurs(2)),
      Schedule.onDecision(([[_error, duration], attempt], decision) =>
        decision._tag === "Continue"
          ? Effect.logInfo(
              `Retrying database connection in ${Duration.format(duration)} (attempt #${++attempt})`,
            )
          : Effect.void,
      ),
    ),
  ),
);


class DataAccess extends Effect.Service<DataAccess>()("@dndevops/Identity_DataAccass", {
	dependencies: [ PgLive ],
	effect: Effect.gen(function*() {
		
		return {
			userExists: (email: string) => Effect.gen(function*() { return false; }),
			addRefreshNonceToUser: (email: string, nonce: string, expiresAt: DateTime.Utc) => Effect.gen(function*() { }),
			getRefreshNoncesByUser: (email: string) => Effect.gen(function*() { return [] as string[]; }),
			removeRefreshNonceFromUser: (email: string, nonce: string) => Effect.gen(function*() { }),
			getRefreshTokens: (email: string) => Effect.gen(function*() { return [] as string[]; }),
			addRefreshTokenToUser: (email: string, refreshToken: string) => Effect.gen(function*() {}),
			createTeam: (displayName: string) => Effect.gen(function*() { return ""; }),
			deleteTeam: (id: string) => Effect.gen(function*() {}),
			updateTeam: (id: string, displayName: string) => Effect.gen(function*() {}),
			getTeamsByUser: (email: string) => Effect.gen(function*() { return [] as string[]; }),
			assignUserToTeam: (email: string, id: string) => Effect.gen(function*() { }),
			removeUserFromTeam: (email: string, id: string) => Effect.gen(function*() { }),
		}
	})
}){};

export class IdentityModule extends Effect.Service<IdentityModule>()("@dndevops/Identity_Module", {
	dependencies: [ DataAccess.Default ],
	effect: Effect.gen(function*() {

		// Module setup
		const mailer = createTransport({
			host: "mailpit",
			port: 1025 ,
			secure: false, // true for 465, false for other ports
			auth: {
				user: "login@doesnt.matter",
				pass: "beepboop",
			},
		});

		const sendMail = async (email: string, subject: string, message: string) => await mailer.sendMail({ from: "dndevops@company.com", to: email, subject, text: message });
		
		const data = yield* DataAccess;

		return {
			requestRefreshToken: (email: string) => Effect.gen(function*() {
				const userExists = yield* data.userExists(email);
				
				if(!userExists)
					return yield* new UserNotFoundError;

				const digits = Array.from({ length: 5}, () => Math.floor(Math.random() * 10))
				const nonce = digits.join("");

				const now = yield* DateTime.now;
				const expiresAt = DateTime.add(now, { minutes: 10});

				yield* data.addRefreshNonceToUser(email, nonce, expiresAt);

				yield* Effect.promise(async () => sendMail(email, "DnDevOps login", "<nonce>"));
			}),
			getRefreshToken: (email: string, nonce: string) => Effect.gen(function*() { 

				const nonces = yield* data.getRefreshNoncesByUser(email);

				if (!nonces.includes(nonce))
					return yield* new UnauthorizedError;

				yield* data.removeRefreshNonceFromUser(email, nonce);

				// TODO: Make refresh token
				const refreshToken = "xxx";

				yield* data.addRefreshTokenToUser(email, refreshToken);
				return refreshToken;
			}),
			getAccessToken: (refreshToken: string) => Effect.gen(function*() {
				let decoded: {[key: string]: any};
				try {
					decoded = jwt.verify(refreshToken, 'shhhhh') as any;
				} catch {
					return yield* new UnauthorizedError;
				}

				const email = decoded.email;

				const tokens = yield* data.getRefreshTokens(email);

				if(!tokens.includes(refreshToken))
					return yield* new UnauthorizedError;

				const teams = yield* data.getTeamsByUser(email);
				const now = yield* DateTime.now;

				const payload = {
					email,
					exp: DateTime.add(now, { minutes: 10 }),
					teams
				};

				const accessToken = "yyy";

				return accessToken;
			}),
			getTeam: (principal: Principal, id: string) => Effect.gen(function*() {}),
			createTeam: (principal: Principal, displayName: string) => Effect.gen(function*() {}),
			deleteTeam: (principal: Principal, id: string) => Effect.gen(function*() {}),
			updateTeam: (principal: Principal, id: string, displayName: string) => Effect.gen(function*() {}),
			assignUserToTeam: (principal: Principal, user: string, team: string) => Effect.gen(function*() {}),
			removeUserFromTeam: (principal: Principal, user: string, team: string) => Effect.gen(function*() {}),
		};
	})
}) {};


class IdentityDataService extends Effect.Service<IdentityDataService>()("@dndevops/IdentityDataService", {
	dependencies: [ ],
	effect: Effect.gen(function*() {

		//Create database connection

		return {
			userExists: (email: string) => Effect.gen(function*() {
				if(email == "laurens@kruis.name")
					return true;

				return false;
			}),

			storeRefreshNonce: (email: string, nonce: string, expiresAt: DateTime.Utc) => Effect.gen(function*() {
				_nonce = nonce;
			}),

			getRefreshNonce: (email: string) => Effect.gen<never, string | undefined>(function*() {
				return  _nonce;
			}),

			storeRefreshToken: (email: string, token: string) => Effect.gen(function*() {

			}),

			/*validateRefreshTokens: (email: string, token: string) => Effect.gen(function*() {

			}),*/

			getRefreshTokens: (email: string) => Effect.gen(function*() {
				return ["", ""];
			}),

			assignUserToTeam: (email: string, team: string) => Effect.gen(function*() {

			}),

			removeUserFromTeam: (email: string, team: string) => Effect.gen(function*() {
				
			}),

			createTeam: (displayName: string) => Effect.gen(function*() {

			}),

			deleteTeam: (id: string) => Effect.gen(function*() {

			}),

			updateTeam: (id: string, displayName: string) => Effect.gen(function*() {

			}),

			getTeam: (id: string) => Effect.gen(function*() {

			}),

			getTeamsByUser: (email: string) => Effect.gen(function*() {
				return ["aaa", "bbb"];
			})
		}
	})
}){};

export class MailService extends Effect.Service<MailService>()("@dndevops/MailService", {
	effect: Effect.gen(function*() {
		const mailer = createTransport({
			host: "mailpit",
			port: 1025 ,
			secure: false, // true for 465, false for other ports
			auth: {
				user: "login@doesnt.matter",
				pass: "beepboop",
			},
		});


		return (email: string, subject: string, message: string) => Effect.promise(async () => {
			await mailer.sendMail({
				from: '"NAME" <dndevops@company.com>',
				to: email,
				subject: subject,
				text: message, // plain‑text body
			});
		});
	})
}){};


export class IdentityService extends Effect.Service<IdentityService>()("@dndevops/IdentityService", {
	dependencies: [ IdentityDataService.Default, MailService.Default ],
	effect: Effect.gen(function*() {
		const data = yield* IdentityDataService;

		const sendMail = yield* MailService;

		return {
			requestRefreshToken: (email: string) => Effect.gen(function*() {
				const exists = yield* data.userExists(email);

				if(!exists)
					return yield* Effect.fail(new UserNotFoundError);

				const digits = Array.from({ length: 5}, () => Math.floor(Math.random() * 10))
				const nonce = digits.join("");

				const now = yield* DateTime.now;
				const expiresAt = DateTime.add(now, { minutes: 10});

				yield* data.storeRefreshNonce(email, nonce, expiresAt);

				yield* sendMail(email, "DNDevOps Login", nonce);
			}),

			getRefreshToken: (email: string, nonce: string) => Effect.gen(function*() {
				const n = yield* data.getRefreshNonce(email);

				if (n != nonce)
					return yield* new UnauthorizedError;

				//Make refresh token
				const refreshToken = "xxx";

				yield* data.storeRefreshToken(email, refreshToken);
				return refreshToken;
			}),

			getAccessToken: (refreshToken: string) => Effect.gen(function*() {

				let decoded: {[key: string]: any};
				try {
					decoded = jwt.verify(refreshToken, 'shhhhh') as any;
				} catch {
					return yield* new UnauthorizedError;
				}

				const email = decoded.email;

				const tokens = yield* data.getRefreshTokens(email);

				if(!tokens.includes(refreshToken))
					return yield* new UnauthorizedError;

				const teams = yield* data.getTeamsByUser(email);
				const now = yield* DateTime.now;

				const payload = {
					email,
					exp: DateTime.add(now, { minutes: 10 }),
					teams
				};

				const accessToken = "yyy";

				return accessToken;
			}),
			/*
				createTeam
				deleteTeam
				updateTeam
				getTeam
			*/
		};
	})
}){};


/*
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
};*/