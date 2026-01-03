CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"team" uuid NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"team" uuid PRIMARY KEY NOT NULL,
	"currency" integer NOT NULL
);
