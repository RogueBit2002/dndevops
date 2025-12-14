import * as PgClient from "@effect/sql-pg/PgClient";

import { Data, Effect, Context, Random, DateTime, Layer, Redacted, Schedule, Duration } from "effect";

import * as jwt from "jsonwebtoken";
import { SqlClient } from "@effect/sql";


import { Principal, TeamData, TeamID } from "@dndevops/domain/identity";
import { InvalidDataError, InvalidPermissionsError, TeamNotFoundError, UnauthorizedError, UserNotFoundError } from "@dndevops/domain/errors";

import { MongooseService, AppConfig, MailService } from "@dndevops/backend-utility/effect";

import mongoose from "mongoose";
import * as uuid from "uuid";


const NONCE_DURATION = 5 * 60;
const REFRESH_DURATION = 7 * 24 * 60 * 60;
const ACCESS_DURATION = 5 * 60;

class DataAccess extends Effect.Service<DataAccess>()("@dndevops/Identity_DataAccass", {
	dependencies: [ MongooseService.Default ],
	effect: Effect.gen(function*() {
	
		const mgoose = yield* MongooseService;


		const teamSchema = new mongoose.Schema({
			uuid: {
				type: String,
				required: true,
				unique: true,
				lowercase: true,
				index: true
			},
			displayName: {
				type: String,
				required: true
			},
			members: [{
				type: String,
				required: true	
			}]
		});

		const nonceSchema = new mongoose.Schema({
			email: {
				type: String,
				required: true,
				index: true
			},
			nonce: {
				type: String,
				required: true,
				index: true
			},

			createdAt: { type: Date, default: Date.now, index: {expires: NONCE_DURATION } }
		});

		const Team = yield* mgoose.use(async (conn) => mongoose.model('Team', teamSchema));
		const Nonce = yield* mgoose.use(async (conn) => mongoose.model('Nonce', nonceSchema));

		console.log(Nonce);
		//const UserIdentity = yield* mgoose.use(async (conn))
		return {
			userExists: Effect.fn(function*(email: string) { 
				return (yield* Effect.promise(() => Team.countDocuments({ members: email }))) > 0;
			}),
			addRefreshNonceToUser: Effect.fn(function*(email: string, nonce: string) {
				//yield* mongoose.use((client) => client.set(`identity/${email}.nonce.${nonce}`, "foo", { expiration: { type: "PXAT", value: expiresAt.epochMillis }}));

				const nonceEntry = new Nonce({
					email: email,
					nonce: nonce
				});

				yield* Effect.promise(() => nonceEntry.save());
			}),
			consumeRefreshNonce: Effect.fn(function*(email: string, nonce: string) {
				const entry = yield* mgoose.use(async (conn) => Nonce.deleteMany({ email, nonce }))

				if(entry.deletedCount === 0)
					return false;

				return true;
				/*const key = `identity/${email}.noncen.${nonce}`;
				const count = yield* redis.use((client) => client.exists(key));

				if (count == 0)
					return false;

				yield* redis.use((client) => client.del(key));

				return true;*/
			}),
			createTeam: Effect.fn(function*(displayName: string) {
				// TODO: Create team

				const id = uuid.v4();
				const team = new Team({
					uuid: id,
					displayName,
					members: []
				});
				
				yield* Effect.promise(() => team.save());

				return id;
			}),
			deleteTeam: Effect.fn(function*(id: string) {
				// TODO: Delete team;
			}),
			teamExists: Effect.fn(function*(id: TeamID) {
				// TODO: Check team

				const result = yield* mgoose.use(async conn => Team.findOne({ uuid: id }));
				
				if(result === null)
					return false;

				return true;
			}),

			updateTeam: Effect.fn(function*(id: string, displayName: string) {
				yield* mgoose.use(async conn => Team.findOneAndUpdate({ uuid: id }, { $set: { displayName } }));
			}),
			getTeamsByUser: Effect.fn(function*(email: string) { 
				/*
				const docs = yield* Effect.promise(() => Team.aggregate([
					// Match documents where 'friends' array contains 'Joe'
					{
						$match: {
							members: email  // Filter documents where 'friends' contains 'Joe'
						}
					},
					// Group by 'nonce' to get unique nonces
					{
						$group: {
							_id: "$uuid"  // Group by the 'nonce' field
						}
					},
					// Project to return only the 'nonce' values
					{
						$project: {
							_id: 0,       // Exclude the '_id' field
							uuid: "$_id"  // Rename '_id' to 'nonce'
						}
					}
				]));

				// Extract the 'nonce' values from the result
				const nonces = result.map(doc => doc.nonce);*/

				const teams = yield* Effect.promise(() => Team.find({ members: email }));

				return teams.map(t => t.uuid) as TeamID[];

			}),
			getTeams: Effect.fn(function*() {
				const ids = yield* Effect.promise(() => Team.distinct("uuid"));

				return ids as TeamID[];
			}),
			getTeam: Effect.fn(function*(id: TeamID) {
				const d = yield* Effect.promise(() => Team.findOne({ uuid: id }));

				if(d === null)
					throw "Team not found";


				return { id: d.uuid, displayName: d.displayName, members: d.members } as ({id: TeamID} & TeamData);
			}),
			assignUserToTeam: Effect.fn(function*(email: string, id: TeamID) {
				yield* mgoose.use(async conn => Team.findOneAndUpdate({ uuid: id}, {
					$addToSet: {
						members: email
					}
				}));
			}),
			removeUserFromTeam: Effect.fn(function*(email: string, id: TeamID) {
				yield* mgoose.use(async conn => Team.findOneAndUpdate({ uuid: id}, {
					$pull: {
						members: email
					}
				}));
			}),
		}
	})
}){};

export class IdentityModule extends Effect.Service<IdentityModule>()("@dndevops/Identity_Module", {
	dependencies: [ DataAccess.Default, AppConfig.Default, MailService.Default ],
	effect: Effect.gen(function*() {

		console.log("Creating IdentityModule!");

		const mail = yield* MailService;
		const data = yield* DataAccess;

		const appConfig = yield* AppConfig;

		return {
			requestRefreshToken: (email: string) => Effect.gen(function*() {
				
				if(!(yield* data.userExists(email)) && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;

				const digits = Array.from({ length: 5}, () => Math.floor(Math.random() * 10))
				const nonce = digits.join("");

				/*const now = yield* DateTime.now;
				const expiresAt = DateTime.add(now, { minutes: 10});*/

				console.log("A");
				yield* data.addRefreshNonceToUser(email, nonce);
				console.log("B");
				yield* mail.send(email, "DnDevOps login", nonce);
				console.log("C");
			}),
			
			getRefreshToken: (email: string, nonce: string) => Effect.gen(function*() { 
				if(!(yield* data.userExists(email)) && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;

				if (!(yield* data.consumeRefreshNonce(email, nonce)))
					return yield* new UnauthorizedError;

				const now = yield* DateTime.now;

				const payload = {
					email,
					exp: DateTime.add(now, { days: 7 }).epochMillis
				}

				const refreshToken = jwt.sign(payload, appConfig.jwt_secret, { algorithm: "HS512" });

				//yield* data.addRefreshTokenToUser(email, refreshToken);

				return refreshToken;
			}),

			getAccessToken: (refreshToken: string) => Effect.gen(function*() {
				let decoded;
				
				try {
					decoded = jwt.verify(refreshToken, appConfig.jwt_secret) as any;
				} catch {
					return yield* new UnauthorizedError;
				}

				const email = decoded.email;

				if(!(yield* data.userExists(email)) && !appConfig.admins.includes(email))
					return yield* new UserNotFoundError;

				// TODO: Implement refreshs token swaps and generational stops
				/*const tokens = yield* data.getRefreshTokens(email);

				if(!tokens.includes(refreshToken))
					return yield* new UnauthorizedError;*/

				const teams = yield* data.getTeamsByUser(email);
				const now = yield* DateTime.now;

				const payload = {
					email,
					exp: DateTime.add(now, { minutes: 10 }).epochMillis,
					teams
				};

				const accessToken = jwt.sign(payload, appConfig.jwt_secret, { algorithm: "HS512" });

				return accessToken;
			}),

			getTeam: (principal: Principal, id: TeamID) => Effect.gen(function*() { 
				if(!(yield* data.teamExists(id)))
					return yield* new TeamNotFoundError;

				return yield* data.getTeams()
			}),

			getTeams: Effect.fn(function*() {
				return yield* data.getTeams();
			}),

			createTeam: Effect.fn(function*(principal: Principal, displayName: string) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				if(!displayName || displayName.length < 1)
					return yield* new InvalidDataError;
				
				const id = yield* data.createTeam(displayName);

				return id;
			}),
			deleteTeam: Effect.fn(function*(principal: Principal, id: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				if(!(yield* data.teamExists(id)))
					return yield* new TeamNotFoundError;

				yield* data.deleteTeam(id);
			}),
			updateTeam: Effect.fn(function*(principal: Principal, id: string, displayName: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;


			}),
			assignUserToTeam: Effect.fn(function*(principal: Principal, user: string, team: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				if(!(yield* data.teamExists(team)))
					return yield* new TeamNotFoundError;

				yield* data.assignUserToTeam(user, team);

			}),
			removeUserFromTeam: Effect.fn(function*(principal: Principal, user: string, team: TeamID) {
				if(!principal.admin)
					return yield* new InvalidPermissionsError;

				if(!(yield* data.userExists(user)) && !appConfig.admins.includes(user))
					return yield* new UserNotFoundError;

				if(!(yield* data.teamExists(team)))
					return yield* new TeamNotFoundError;

				yield* data.removeUserFromTeam(user, team);
			})
		};
	})
}) {};