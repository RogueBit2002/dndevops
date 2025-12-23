CREATE TABLE "refresh_codes" (
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "refresh_codes_email_code_pk" PRIMARY KEY("email","code")
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"token" text PRIMARY KEY NOT NULL,
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
	"name" varchar(24) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_id_teams_id_fk" FOREIGN KEY ("id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;