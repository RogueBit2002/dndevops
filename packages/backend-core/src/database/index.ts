import { Context, Effect } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export class DrizzleService extends Context.Tag("@dndevops/backend-core/database/DrizzleService")<DrizzleService, {
	readonly use: <T>(callback: (db: ReturnType<typeof drizzle> ) => T | Promise<T>) => Effect.Effect<T>;
}>(){
	static readonly make = Effect.fn(function*(uri: string) {

		const pool = yield* Effect.acquireRelease(
			Effect.sync(() => new Pool({ connectionString: uri })), 
			(pool, exit) => Effect.promise(() => pool.end()));
		
		// TODO: Test connection
		// TODO: Handle reconnects

		const db = drizzle(pool);

		// TODO: Handle errors

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
	})
}