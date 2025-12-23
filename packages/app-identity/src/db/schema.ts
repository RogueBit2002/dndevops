import { timestamp, primaryKey, uuid, pgTable, varchar, text } from "drizzle-orm/pg-core";

const emailType = varchar({length: 255}).notNull();

export const refreshCodeTable = pgTable("refresh_codes", {
	email: emailType,
	code: varchar({length: 6}).notNull(),
	expires_at: timestamp().notNull()
}, (table) => ({
	pk: primaryKey({ columns: [ table.email, table.code]})
}));

export const refreshTokenTable = pgTable("refresh_token", {
  token: text().primaryKey().notNull(),
  email: emailType,
  expires_at: timestamp().notNull(),
});

export const teamTable = pgTable("teams", {
	id: uuid().notNull().primaryKey(),
	name: varchar({length: 24}).notNull(),
});

export const teamMemberTable = pgTable("team_members", {
	id: uuid().notNull().references(() => teamTable.id),
	email: emailType
});