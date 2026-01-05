CREATE TABLE "boards" (
	"team" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"team" uuid PRIMARY KEY NOT NULL,
	"currency" integer NOT NULL
);
