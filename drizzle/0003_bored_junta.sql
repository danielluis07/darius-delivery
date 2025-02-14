ALTER TABLE "free_tests" RENAME COLUMN "request_date" TO "created_at";--> statement-breakpoint
ALTER TABLE "deliverers" ALTER COLUMN "user_id" DROP NOT NULL;