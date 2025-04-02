ALTER TABLE "combos" ADD COLUMN "type" text DEFAULT 'COMBO' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "type" text DEFAULT 'PRODUCT' NOT NULL;