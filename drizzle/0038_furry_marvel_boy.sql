CREATE TYPE "public"."admin_transaction_type" AS ENUM('COMISSION', 'SUBSCRIPTION');--> statement-breakpoint
CREATE TABLE "admin_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" "admin_transaction_type",
	"amount" integer NOT NULL,
	"reference_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_transactions" ADD CONSTRAINT "admin_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;