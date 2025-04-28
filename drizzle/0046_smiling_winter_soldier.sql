CREATE TABLE "additional_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"selection_type" text DEFAULT 'multiple' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "additionals" (
	"id" text PRIMARY KEY NOT NULL,
	"additional_group_id" text NOT NULL,
	"name" text NOT NULL,
	"price_adjustment" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "additional_groups" ADD CONSTRAINT "additional_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "additionals" ADD CONSTRAINT "additionals_additional_group_id_additional_groups_id_fk" FOREIGN KEY ("additional_group_id") REFERENCES "public"."additional_groups"("id") ON DELETE cascade ON UPDATE no action;