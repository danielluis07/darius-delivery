CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" varchar NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
