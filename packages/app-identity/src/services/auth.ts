import { Context, Effect } from "effect";
import { TeamService } from "./team";
import { UserNotFoundError } from "@dndevops/domain/errors";
import { AppConfig, MailSender } from "@dndevops/backend-core";
import { DrizzleService } from "@dndevops/backend-core/database";

import { TeamID } from "@dndevops/domain/identity";


/*
export class AuthenticationService extends Context.Tag("@dndevops/Identity/AuthenticationService")<AuthenticationService, {
	readonly make
}>() {};*/

export class AuthenticationService extends Effect.Service<AuthenticationService>()("@dndevops/app-identity/AuthenticationService", {
	dependencies: [ AppConfig.Default ],
	effect: Effect.gen(function*() {

		const appConfig = yield* AppConfig;
		const sendMail = yield* MailSender;
		
		const drizzle = yield* DrizzleService;
		const REFRESH_CODE_LENGTH = 5;


		const getTeamsByUser = Effect.fn(function*(email: string) {
			return [] as TeamID[];
		});

		return {
			requestRefreshToken: Effect.fn(function*(email: string) {
				const teams = yield* getTeamsByUser(email);

				if(teams.length == 0 && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;


				const digits = Array.from({ length: REFRESH_CODE_LENGTH}, () => Math.floor(Math.random() * 10))
				const code = digits.join("");

				// TODO: Add code to database

				yield* sendMail(email, "Login code", `${code}`);
			}),

			getRefreshToken: Effect.fn(function*(email: string, code: string) {
				const teams = yield* getTeamsByUser(email);

				if(teams.length == 0 && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;

				// Check code existance

				return "";
			}),

			getAccessToken: Effect.fn(function*(refreshToken: string) {
				return "";
			})
		}
	})
}){}


//Layer<AuthenticationService, never, DrizzleService>
