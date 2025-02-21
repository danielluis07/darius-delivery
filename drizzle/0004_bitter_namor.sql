CREATE TYPE "public"."order_payment_type" AS ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_type" "order_payment_type" NOT NULL;