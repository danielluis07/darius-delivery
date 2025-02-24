ALTER TABLE "customizations" RENAME COLUMN "logo_desktop" TO "logo";--> statement-breakpoint
ALTER TABLE "customizations" ADD COLUMN "payment_methods" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "logo_mobile";