ALTER TABLE "user" RENAME COLUMN "holder_name" TO "credit_card_holder_name";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "number" TO "credit_card_number";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "expiry_month" TO "credit_card_expiry_month";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "expiry_year" TO "credit_card_expiry_year";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "ccv" TO "credit_card_ccv";