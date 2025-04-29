CREATE TABLE "colors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"template_id" text NOT NULL,
	"button" varchar(7) DEFAULT '#ffffff',
	"background" varchar(7) DEFAULT '#ffffff',
	"header" varchar(7) DEFAULT '#ffffff',
	"font" varchar(7) DEFAULT '#000000',
	"footer" varchar(7) DEFAULT '#ffffff',
	"footer_button" varchar(7) DEFAULT '#ffffff',
	"product_name" varchar(7) DEFAULT '#000000',
	"product_price" varchar(7) DEFAULT '#000000',
	"cart" varchar(7) DEFAULT '#000000'
);
--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "button_color";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "background_color";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "header_color";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "font_color";--> statement-breakpoint
ALTER TABLE "customizations" DROP COLUMN "footer_color";--> statement-breakpoint
ALTER TABLE "product_additional_groups" DROP COLUMN "price_adjustment_override";--> statement-breakpoint
ALTER TABLE "product_additional_groups" DROP COLUMN "selection_type_override";--> statement-breakpoint
ALTER TABLE "product_additional_groups" DROP COLUMN "is_required_override";