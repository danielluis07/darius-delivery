CREATE TYPE "public"."free_test_status" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'CONVERTED');--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "store_phone" varchar(255);--> statement-breakpoint
ALTER TABLE "free_tests" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "free_tests" ADD COLUMN "status" "free_test_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "free_tests" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_trial" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "free_tests" ADD CONSTRAINT "free_tests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_tests" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "free_tests" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "free_tests" DROP COLUMN "domain";--> statement-breakpoint
ALTER TABLE "free_tests" DROP COLUMN "whatsapp";--> statement-breakpoint
ALTER TABLE "free_tests" DROP COLUMN "password";