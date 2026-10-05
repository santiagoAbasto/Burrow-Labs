ALTER TABLE "analytics_events" ADD COLUMN "visitor" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "device" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "browser" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "lang" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "bot" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "analytics_events_bot_created_idx" ON "analytics_events" USING btree ("bot","created_at");