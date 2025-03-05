ALTER TABLE "customizations" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "state" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "neighborhood" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "street" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "street_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "is_open" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "need_change" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "change_value" integer;--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "need_change";