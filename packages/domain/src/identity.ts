import { Schema } from "effect";
import * as uuid from "uuid";

export const TeamIDSchema = Schema.String.pipe(Schema.filter(s => uuid.validate(s) && uuid.version(s) == 4 ));
export type TeamID = typeof TeamIDSchema.Type;

export const TeamDataSchema = Schema.Struct({
        displayName: Schema.String.pipe(Schema.filter(s => s.length > 1)),
        members: Schema.Array(Schema.String)
});

export type TeamData = typeof TeamDataSchema.Type;

export interface Principal {
        email: string
        teams: TeamID[];
        admin: boolean;
}