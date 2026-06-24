CREATE TABLE "cover_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"src" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
