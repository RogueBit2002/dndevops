import { timestamp, primaryKey, char, uuid, pgTable, varchar, text } from "drizzle-orm/pg-core";

const emailType = varchar({length: 255}).notNull();

export const refreshCodeTable = pgTable("refresh_codes", {
	email: emailType,
	hashed_code: char({ length: 64 }).notNull(),
	salt: char({ length: 32 }).notNull(),
	expires_at: timestamp().notNull(),
}/*, (table) => ({
	pk: primaryKey({ columns: [ table.email, table.hashed_code, table.salt]})
})*/);

export const refreshTokenTable = pgTable("refresh_token", {
	id: uuid().notNull().primaryKey(),
	hashed_token: char({ length: 64 }).notNull(),
	salt: char({ length: 32 }).notNull(),
	email: emailType,
	expires_at: timestamp().notNull(),
}/*, (table) => ({
	pk: primaryKey({ columns: [ table.hashed_token, table.salt ]})
})*/);

export const teamTable = pgTable("teams", {
	id: uuid().notNull().primaryKey(),
	name: varchar({length: 48}).notNull(),
});

export const teamMemberTable = pgTable("team_members", {
	id: uuid().notNull().references(() => teamTable.id),
	email: emailType
});