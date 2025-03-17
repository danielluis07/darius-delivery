ALTER TYPE "public"."role" ADD VALUE 'EMPLOYEE';--> statement-breakpoint
CREATE TABLE "employee" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"restaurantOwnerId" text,
	"permissions" text[] DEFAULT '{}',
	CONSTRAINT "employee_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_restaurantOwnerId_user_id_fk" FOREIGN KEY ("restaurantOwnerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;