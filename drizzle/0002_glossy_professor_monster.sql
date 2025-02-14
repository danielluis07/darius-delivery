ALTER TABLE "deliverers" ALTER COLUMN "phone" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "deliverers" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deliverers" ALTER COLUMN "vehicle_plate" SET DATA TYPE varchar(7);