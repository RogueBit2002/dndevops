import { uuid, pgTable, varchar, integer, jsonb } from "drizzle-orm/pg-core";

export const inventoryTable = pgTable("inventories", {
	team: uuid().notNull().primaryKey(),
	currency: integer().notNull(),
});

export const boardTable = pgTable("boards", {
	id: uuid().notNull().primaryKey(),
	team: uuid().notNull(),
	data: jsonb().notNull()
});