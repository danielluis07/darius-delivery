CREATE TYPE "public"."admin_transaction_type" AS ENUM('COMISSION', 'SUBSCRIPTION');--> statement-breakpoint
CREATE TYPE "public"."free_test_status" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED', 'CONVERTED');--> statement-breakpoint
CREATE TYPE "public"."order_payment_type" AS ENUM('CASH', 'CREDIT_CARD', 'PIX', 'CARD', 'DEBIT_CARD');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('ACCEPTED', 'PREPARING', 'FINISHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'WITHDRAWN', 'CONSUME_ON_SITE');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('LOCAL', 'WEBSITE', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER', 'CUSTOMER', 'EMPLOYEE');--> statement-breakpoint
CREATE TYPE "public"."subscription_type" AS ENUM('BASIC', 'PREMIUM');--> statement-breakpoint
CREATE TYPE "public"."template_name" AS ENUM('TEMPLATE_1', 'TEMPLATE_2', 'TEMPLATE_3', 'TEMPLATE_4');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('PAYMENT', 'REFUND', 'FEE');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "additional_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"name" text NOT NULL,
	"selection_type" text DEFAULT 'multiple' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "additionals" (
	"id" text PRIMARY KEY NOT NULL,
	"additional_group_id" text NOT NULL,
	"name" text NOT NULL,
	"price_adjustment" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"type" "admin_transaction_type",
	"amount" integer NOT NULL,
	"reference_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"referral_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "affiliates_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"name" text NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "category_additional_groups" (
	"category_id" text NOT NULL,
	"additional_group_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "category_additional_groups_category_id_additional_group_id_pk" PRIMARY KEY("category_id","additional_group_id")
);
--> statement-breakpoint
CREATE TABLE "colors" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"template_id" text NOT NULL,
	"button" varchar(7) DEFAULT '#ffffff',
	"background" varchar(7) DEFAULT '#ffffff',
	"header" varchar(7) DEFAULT '#ffffff',
	"font" varchar(7) DEFAULT '#000000',
	"footer" varchar(7) DEFAULT '#ffffff',
	"footer_font" varchar(7) DEFAULT '#000000',
	"footer_button" varchar(7) DEFAULT '#ffffff',
	"product_card_name" varchar(7) DEFAULT '#000000',
	"product_card_price" varchar(7) DEFAULT '#000000',
	"product_card_description" varchar(7) DEFAULT '#000000',
	"product_name" varchar(7) DEFAULT '#000000',
	"product_price" varchar(7) DEFAULT '#000000',
	"product_details" varchar(7) DEFAULT '#000000',
	"product_description" varchar(7) DEFAULT '#000000',
	"additionals" varchar(7) DEFAULT '#000000',
	"additionals_font" varchar(7) DEFAULT '#000000',
	"cart" varchar(7) DEFAULT '#000000'
);
--> statement-breakpoint
CREATE TABLE "combo_products" (
	"combo_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "combo_products_combo_id_product_id_pk" PRIMARY KEY("combo_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "combos" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"type" text DEFAULT 'COMBO' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"percentage" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"asaas_customer_id" text,
	"store_id" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"neighborhood" text NOT NULL,
	"street" text NOT NULL,
	"street_number" text NOT NULL,
	"postal_code" text NOT NULL,
	"complement" text,
	CONSTRAINT "customers_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "customizations" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"template_id" text NOT NULL,
	"store_name" text NOT NULL,
	"store_phone" varchar(255),
	"city" text NOT NULL,
	"state" text NOT NULL,
	"neighborhood" text NOT NULL,
	"street" text NOT NULL,
	"street_number" text NOT NULL,
	"postal_code" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"place_id" text,
	"is_open" boolean DEFAULT false NOT NULL,
	"payment_methods" text[] DEFAULT '{}',
	"logo" text,
	"banner" text,
	"opening_hours" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverers" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"vehicle" varchar(100) NOT NULL,
	"vehicle_plate" varchar(7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_areas" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"city" varchar(255) NOT NULL,
	"state" varchar(2) NOT NULL,
	"neighborhood" varchar(255) NOT NULL,
	"delivery_fee" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_areas_km" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"latitude" real,
	"longitude" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_areas_km_fees" (
	"id" text PRIMARY KEY NOT NULL,
	"delivery_area_id" text,
	"distance" real,
	"price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"store_id" text,
	"permissions" text[] DEFAULT '{}',
	CONSTRAINT "employee_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"product_id" text,
	"combo_id" text,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"delivery_deadline" integer DEFAULT 30 NOT NULL,
	"pickup_deadline" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"deliverer_id" text,
	"customer_id" text,
	"number" serial NOT NULL,
	"daily_number" integer NOT NULL,
	"status" "order_status" NOT NULL,
	"type" "order_type" NOT NULL,
	"total_price" integer NOT NULL,
	"obs" text,
	"latitude" real,
	"longitude" real,
	"place_id" text,
	"payment_status" "payment_status" NOT NULL,
	"half_option" text,
	"is_closed" boolean DEFAULT false NOT NULL,
	"need_change" boolean DEFAULT false NOT NULL,
	"change_value" integer,
	"payment_type" "order_payment_type" NOT NULL,
	"delivery_deadline" integer,
	"pickup_deadline" integer,
	"city" text,
	"state" text,
	"neighborhood" text,
	"street" text,
	"street_number" text,
	"postal_code" text,
	"complement" text,
	"size" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "password_reset_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "pixels" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"pixel_facebook" varchar(255),
	"pixel_google" varchar(255),
	"pixel_tiktok" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"category_id" text,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"allow_half_option" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"image" text,
	"type" text DEFAULT 'PRODUCT' NOT NULL,
	"sizes" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"order_id" text NOT NULL,
	"receipt_number" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_id" text,
	"referred_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referrals_referred_user_id_unique" UNIQUE("referred_user_id")
);
--> statement-breakpoint
CREATE TABLE "restaurant_data" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"menu_views" integer DEFAULT 0,
	"items_added_to_cart" integer DEFAULT 0,
	"items_purchased" integer DEFAULT 0,
	"withdrawals" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"google_api_key" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"asaas_sub_id" text,
	"user_id" text,
	"store_id" text,
	"subscription_type" "subscription_type",
	"status" text NOT NULL,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" "template_name" NOT NULL,
	"description" text,
	"preview_image" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text,
	"order_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"status" "transaction_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_confirmation" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_token" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "two_factor_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"password" varchar(255),
	"image" text,
	"is_two_factor_enabled" boolean DEFAULT false,
	"emailVerified" timestamp,
	"phone" varchar(255),
	"role" "role",
	"cpf_cnpj" varchar(20),
	"income_value" integer,
	"address" text,
	"address_number" text,
	"province" text,
	"postal_code" text,
	"company_type" text,
	"wallet_id" text,
	"asaas_api_key" text,
	"user_customer_id" text,
	"bank_code" varchar(10),
	"owner_name" varchar(255),
	"bank_agency" varchar(10),
	"bank_account" varchar(20),
	"bank_account_digit" varchar(2),
	"bank_account_type" text,
	"pix_address_key" varchar(255),
	"credit_card_holder_name" text,
	"credit_card_number" text,
	"credit_card_expiry_month" text,
	"credit_card_expiry_year" text,
	"credit_card_ccv" text,
	"comission_percentage" numeric(5, 2),
	"domain" varchar(255),
	"is_subscribed" boolean DEFAULT false,
	"is_trial" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"trial_ends_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "additional_groups" ADD CONSTRAINT "additional_groups_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "additionals" ADD CONSTRAINT "additionals_additional_group_id_additional_groups_id_fk" FOREIGN KEY ("additional_group_id") REFERENCES "public"."additional_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_transactions" ADD CONSTRAINT "admin_transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_additional_groups" ADD CONSTRAINT "category_additional_groups_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_additional_groups" ADD CONSTRAINT "category_additional_groups_additional_group_id_additional_groups_id_fk" FOREIGN KEY ("additional_group_id") REFERENCES "public"."additional_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "colors" ADD CONSTRAINT "colors_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_products" ADD CONSTRAINT "combo_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combos" ADD CONSTRAINT "combos_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customizations" ADD CONSTRAINT "customizations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customizations" ADD CONSTRAINT "customizations_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverers" ADD CONSTRAINT "deliverers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_areas" ADD CONSTRAINT "delivery_areas_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_areas_km" ADD CONSTRAINT "delivery_areas_km_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_areas_km_fees" ADD CONSTRAINT "delivery_areas_km_fees_delivery_area_id_delivery_areas_km_id_fk" FOREIGN KEY ("delivery_area_id") REFERENCES "public"."delivery_areas_km"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_combo_id_combos_id_fk" FOREIGN KEY ("combo_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_settings" ADD CONSTRAINT "order_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliverer_id_deliverers_id_fk" FOREIGN KEY ("deliverer_id") REFERENCES "public"."deliverers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_userId_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pixels" ADD CONSTRAINT "pixels_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_data" ADD CONSTRAINT "restaurant_data_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_confirmation" ADD CONSTRAINT "two_factor_confirmation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;