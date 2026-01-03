import { Schema } from "effect";
import * as uuid from "uuid";

export const TeamIDSchema = Schema.String.pipe(Schema.filter(s => uuid.validate(s) && uuid.version(s) == 4 ));
export type TeamID = typeof TeamIDSchema.Type;

export const TeamDataSchema = Schema.Struct({
        displayName: Schema.String.pipe(Schema.filter(s => s.length > 1)),
        members: Schema.Array(Schema.String)
});

export type TeamData = typeof TeamDataSchema.Type;

export const PrincipalSchema = Schema.Struct({
	email: Schema.String,
	teams: Schema.Array(TeamIDSchema),
	admin: Schema.Boolean
});

export type Principal = typeof PrincipalSchema.Type;