ALTER TABLE "user" ADD COLUMN "bank_code" varchar(10);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "owner_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bank_agency" varchar(10);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bank_account" varchar(20);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bank_account_digit" varchar(2);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bank_account_type" varchar(10);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "pix_address_key" varchar(255);--> statement-breakpoint
ALTER TABLE "public"."orders" ALTER COLUMN "payment_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."order_payment_type";--> statement-breakpoint
CREATE TYPE "public"."order_payment_type" AS ENUM('CASH', 'CREDIT_CARD', 'PIX', 'CARD');--> statement-breakpoint
ALTER TABLE "public"."orders" ALTER COLUMN "payment_type" SET DATA TYPE "public"."order_payment_type" USING "payment_type"::"public"."order_payment_type";