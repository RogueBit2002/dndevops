import { Context, DateTime, Effect, Redacted } from "effect";
import { TeamService } from "./team";
import { UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";
import { AppConfig, MailSender } from "@dndevops/backend-core";
import { DrizzleService } from "@dndevops/backend-core/database";

import { TeamID } from "@dndevops/domain/identity";
import { refreshCodeTable, refreshTokenTable, teamMemberTable } from "../db/schema";
import { and, eq } from "drizzle-orm/pg-core/expressions";

import * as jwt from "jsonwebtoken";

export class AuthenticationService extends Effect.Service<AuthenticationService>()("@dndevops/app-identity/AuthenticationService", {
	dependencies: [ AppConfig.Default ],
	effect: Effect.gen(function*() {

		const appConfig = yield* AppConfig;
		const sendMail = yield* MailSender;
		
		const drizzle = yield* DrizzleService;
		const REFRESH_CODE_LENGTH = 6;


		const getTeamsByUser = Effect.fn(function*(email: string) {
			const rows = yield* drizzle.use(async db => db.select().from(teamMemberTable).where(eq(teamMemberTable.email, email)));
			return rows.map(r => r.id);
		});

		return {
			requestRefreshToken: Effect.fn(function*(email: string) {
				const teams = yield* getTeamsByUser(email);

				if(teams.length == 0 && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;


				const digits = Array.from({ length: REFRESH_CODE_LENGTH}, () => Math.floor(Math.random() * 10))
				const code = digits.join("");

				const now = yield* DateTime.now;
				const expires_at = DateTime.add(now, { minutes: 5 });

				// TODO: Add code to database
				const r = yield* drizzle.use(async db => db.insert(refreshCodeTable).values({ email, code, expires_at: new Date(expires_at.epochMillis) }).onConflictDoUpdate({
					target: [ refreshCodeTable.email, refreshCodeTable.code ],
					set: { expires_at: new Date(expires_at.epochMillis) }
				}));

				yield* sendMail(email, "Login code", `${code}`);
			}),

			getRefreshToken: Effect.fn(function*(email: string, code: string) {
				const teams = yield* getTeamsByUser(email);

				if(teams.length == 0 && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;

				// Check code existance

				const deletes = yield* drizzle.use(async db => 
					db.delete(refreshCodeTable).where(
						and(
							eq(refreshCodeTable.email, email),
							eq(refreshCodeTable.code, code)
						)
					).returning()
				);

				const now = yield* DateTime.now;


				if(deletes.length < 1)
					return yield* new UnauthorizedError;
					

				// Check for expired codes
				for(const row of deletes)
					if(now.epochMillis > row.expires_at.getTime())
						return yield* new UnauthorizedError;
						
				
				const payload = {
						email,
						exp: Math.floor(DateTime.add(now, { days: 7 }).epochMillis / 1000)
				}

				const refreshToken = jwt.sign(payload, Redacted.value(appConfig.jwtSecret), { algorithm: "HS512" });

				yield* drizzle.use(async db => db.insert(refreshTokenTable).values({
					email,
					token: refreshToken,
					expires_at: new Date(payload.exp)
				}));

				return refreshToken;
			}),

			getAccessToken: Effect.fn(function*(refreshToken: string) {

				let decoded;

				try {
					decoded = jwt.verify(refreshToken, Redacted.value(appConfig.jwtSecret)) as any;
				} catch {
					return yield* new UnauthorizedError;
				}

				const email = decoded.email;
				
				// TODO: Check db for refresh token

				// TODO: Generate new refresh token and swap

				const teams = yield* getTeamsByUser(email);
				const now = yield* DateTime.now;

				const payload = {
					email,
					exp: Math.floor(DateTime.add(now, { minutes: 5}).epochMillis / 1000),
					admin: appConfig.admins.includes(email),
					teams
				};

				const accessToken = jwt.sign(payload, Redacted.value(appConfig.jwtSecret), { algorithm: "HS512" });

				return accessToken;
			})
		}
	})
}){};