CREATE TABLE "commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;