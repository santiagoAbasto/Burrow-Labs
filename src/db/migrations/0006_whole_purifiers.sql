CREATE TYPE "public"."project_sheet_status" AS ENUM('new', 'in_progress', 'paused', 'delivered');--> statement-breakpoint
CREATE TABLE "project_sheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text DEFAULT '' NOT NULL,
	"token" text NOT NULL,
	"empresa" text DEFAULT '' NOT NULL,
	"status" "project_sheet_status" DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'Media' NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_sheets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "project_sheets_status_updated_idx" ON "project_sheets" USING btree ("status","updated_at");