import { uuid, pgTable, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const inventoryTable = pgTable("inventories", {
	team: uuid().notNull().primaryKey(),
	currency: integer().notNull(),
});

export const boardTable = pgTable("boards", {
	team: uuid().notNull().primaryKey(),
	data: jsonb().notNull()
});