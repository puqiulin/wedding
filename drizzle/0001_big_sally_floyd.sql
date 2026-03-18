ALTER TABLE "photos" ADD COLUMN "file_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "file_size" integer DEFAULT 0 NOT NULL;