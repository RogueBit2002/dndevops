import { Data, Schema } from "effect";
import * as uuid from "uuid";
import { TeamIDSchema } from "./identity";

export const InventorySchema = Schema.Struct({
	team: TeamIDSchema,
	currency: Schema.Positive
});

export type Inventory = typeof InventorySchema.Type;

export const BoardIDSchema = Schema.String.pipe(Schema.filter(s => uuid.validate(s) && uuid.version(s) == 4 ));
export type BoardID = typeof BoardIDSchema.Type;

export const BoardSchema = Schema.Struct({
	team: TeamIDSchema,
	id: BoardIDSchema,
	tiles: Schema.Array(Schema.Number).pipe(Schema.filter(a => Math.sqrt(a.length) % 1 === 0 && a.length >= 3*3)) //Only allow square grids with 3x3 minimum
});

export type Board = typeof BoardSchema.Type;


/*
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

export type Principal = typeof PrincipalSchema.Type;*/