CREATE TABLE "product_additional_groups" (
	"product_id" text NOT NULL,
	"additional_group_id" text NOT NULL,
	"price_adjustment_override" integer,
	"selection_type_override" text,
	"is_required_override" boolean,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "product_additional_groups_product_id_additional_group_id_pk" PRIMARY KEY("product_id","additional_group_id")
);
--> statement-breakpoint
ALTER TABLE "additional_groups" DROP CONSTRAINT "additional_groups_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_additional_groups" ADD CONSTRAINT "product_additional_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_additional_groups" ADD CONSTRAINT "product_additional_groups_additional_group_id_additional_groups_id_fk" FOREIGN KEY ("additional_group_id") REFERENCES "public"."additional_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "additional_groups" DROP COLUMN "product_id";