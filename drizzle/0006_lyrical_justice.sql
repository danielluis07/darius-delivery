ALTER TABLE "public"."orders" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."order_type";--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('LOCAL', 'WEBSITE', 'WHATSAPP');--> statement-breakpoint
ALTER TABLE "public"."orders" ALTER COLUMN "type" SET DATA TYPE "public"."order_type" USING "type"::"public"."order_type";