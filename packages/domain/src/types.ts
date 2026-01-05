import { Data, Schema } from "effect";
import * as uuid from "uuid";
import { TeamIDSchema } from "./identity";

export const InventorySchema = Schema.Struct({
	team: TeamIDSchema,
	currency: Schema.Positive
});

export type Inventory = typeof InventorySchema.Type;

export class AliveTile extends Schema.TaggedClass<AliveTile>()("@dndevops/domain/AliveTile", {

}) { };

export const BoardDataSchema = Schema.Struct({
	tiles: Schema.Array(Schema.NullOr(AliveTile)).pipe(Schema.filter(a => Math.sqrt(a.length) % 1 === 0 && a.length >= 3*3)) //Only allow square grids with 3x3 minimum	
});
export type BoardData = typeof BoardDataSchema.Type;

export const BoardSchema = Schema.Struct({
	team: TeamIDSchema,
	data: BoardDataSchema
});

export type Board = typeof BoardSchema.Type;