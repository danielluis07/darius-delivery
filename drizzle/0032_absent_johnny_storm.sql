CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"asaas_sub_id" text,
	"user_id" text NOT NULL,
	"subscription_type" "subscription_type",
	"status" text NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "is_trial" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;