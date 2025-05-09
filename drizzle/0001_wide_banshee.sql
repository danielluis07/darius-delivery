CREATE TABLE "template_address" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"template_id" text NOT NULL,
	"store_phone" varchar(255),
	"city" text NOT NULL,
	"state" text NOT NULL,
	"neighborhood" text NOT NULL,
	"street" text NOT NULL,
	"street_number" text NOT NULL,
	"postal_code" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"place_id" text
);
--> statement-breakpoint
ALTER TABLE "colors" RENAME COLUMN "store_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "customizations" RENAME COLUMN "store_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "colors" DROP CONSTRAINT "colors_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "customizations" DROP CONSTRAINT "customizations_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "template_address" ADD CONSTRAINT "template_address_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_address" ADD CONSTRAINT "template_address_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customizations" ADD CONSTRAINT "customizations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "store_phone";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "neighborhood";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "street";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "street_number";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "place_id";