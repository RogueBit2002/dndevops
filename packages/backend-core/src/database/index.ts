import { Context, Effect, Schedule, Schema } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";

export class DatabaseConnectionError extends Schema.TaggedError<DatabaseConnectionError>()("@dndevops/DatabaseConnectionError", {}) {};

export class DrizzleService extends Context.Tag("@dndevops/DrizzleService")<
	DrizzleService,
	{
		readonly use: <T>(callback: (db: ReturnType<typeof drizzle>) => T | Promise<T>) => Effect.Effect<T>;
	}
>() {
	static readonly make = Effect.fn(function*(uri: string) {

		const pool = yield* Effect.acquireRelease(Effect.sync(() => {
			return new Pool({
  				connectionString: uri,
			});
		}), (pool) => Effect.promise(() => pool.end()));

		/*yield* Effect.tryPromise(() => pool.query("SELECT 1")).pipe(
			Effect.retry(Schedule.jitteredWith(Schedule.spaced("1.25 seconds"), { min: 0.5, max: 1.5})).pipe(Schedule.tapOutput),
			Effect.orDie
		);*/

		const db = drizzle(uri);

		return DrizzleService.of({
			use: Effect.fn(function*<T>(callback: (db: ReturnType<typeof drizzle>) => T | Promise<T>) {
				const result = yield* Effect.try({
					try: () => callback(db),
					catch: (e) => {
						console.error("Throwing because error handling hasn't been implemented yet");
						throw e;
					}
				});

				if(result instanceof Promise)
					return yield* Effect.tryPromise({
						try: () => result,
						catch: (e) => {
							console.error("Throwing because error handling hasn't been implemented yet");
							throw e;
						}
					});

				return result;
			})
		});
	});
};