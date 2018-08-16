CREATE TABLE "customers" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(80),
  "first_name" VARCHAR(80),
  "last_name" VARCHAR(80),
  "street" VARCHAR(80),
  "municipality" VARCHAR(80),
  "province" VARCHAR(80),
  "zipcode" VARCHAR(80)
  
);

CREATE TABLE "brands" (
  "id" SERIAL PRIMARY KEY,
  "brand_name" VARCHAR(80),
  "brand_description" VARCHAR(1000)
);

CREATE TABLE "products_category" (
  "id" SERIAL PRIMARY KEY,
  "category_name" VARCHAR(80)
);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "product_name" VARCHAR(80),
  "product_description" VARCHAR(500),
  "price" FLOAT(2),
  "pic" VARCHAR(500),
  "category_id" INT REFERENCES products_category(id),
  "brand_id" INT REFERENCES brands(id)
);

CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id),
  "order_date" timestamp DEFAULT current_timestamp,
  "quantity" INT
);

CREATE TABLE "customer_favorite_products" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id)
);