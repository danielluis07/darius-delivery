CREATE TABLE "order_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_deadline" integer DEFAULT 30 NOT NULL,
	"pickup_deadline" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "delivery_deadline";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "pickup_deadline";