CREATE TYPE "public"."order_type" AS ENUM('LOCAL', 'ONLINE');--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "type" "order_type";