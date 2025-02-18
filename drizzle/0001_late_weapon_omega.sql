ALTER TABLE "orders" ALTER COLUMN "delivery_deadline" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "pickup_deadline" DROP NOT NULL;