ALTER TABLE "user" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "restaurantOwnerId" text;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_restaurantOwnerId_user_id_fk" FOREIGN KEY ("restaurantOwnerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "updated_at";