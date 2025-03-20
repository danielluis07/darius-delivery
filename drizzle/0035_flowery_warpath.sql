CREATE TABLE "restaurant_data" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"menu_views" integer DEFAULT 0,
	"items_added_to_cart" integer DEFAULT 0,
	"items_purchased" integer DEFAULT 0,
	"withdrawals" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "restaurant_data" ADD CONSTRAINT "restaurant_data_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;