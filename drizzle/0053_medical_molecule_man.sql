CREATE TABLE "category_additional_groups" (
	"category_id" text NOT NULL,
	"additional_group_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "category_additional_groups_category_id_additional_group_id_pk" PRIMARY KEY("category_id","additional_group_id")
);
--> statement-breakpoint
DROP TABLE "product_additional_groups" CASCADE;--> statement-breakpoint
ALTER TABLE "category_additional_groups" ADD CONSTRAINT "category_additional_groups_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_additional_groups" ADD CONSTRAINT "category_additional_groups_additional_group_id_additional_groups_id_fk" FOREIGN KEY ("additional_group_id") REFERENCES "public"."additional_groups"("id") ON DELETE cascade ON UPDATE no action;