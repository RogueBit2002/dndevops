CREATE TABLE "refresh_codes" (
	"email" varchar(255) NOT NULL,
	"hashed_code" char(64) NOT NULL,
	"salt" char(32) NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hashed_token" char(64) NOT NULL,
	"salt" char(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid NOT NULL,
	"email" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(48) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_id_teams_id_fk" FOREIGN KEY ("id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;