CREATE TABLE "combo_products" (
	"combo_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "combo_products_combo_id_product_id_pk" PRIMARY KEY("combo_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;