ALTER TABLE "free_tests" RENAME COLUMN "subdomain" TO "domain";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "subdomain" TO "domain";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_subdomain_unique";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_domain_unique" UNIQUE("domain");