# eternal-clothing-store

## Database Schemas

The application uses a relational database to store e‑commerce data. Below is a concise representation of each table, its columns, data types, and key constraints.

| Table | Column | Data Type | Constraints |
|-------|--------|-----------|-------------|
| **users** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | email | TEXT | NOT NULL, UNIQUE |
|  | password_hash | TEXT | NOT NULL |
|  | name | TEXT | NOT NULL |
|  | created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| **products** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | name | TEXT | NOT NULL |
|  | description | TEXT | |
|  | price_cents | INTEGER | NOT NULL |
|  | stock_quantity | INTEGER | NOT NULL |
|  | category_id | INTEGER | FOREIGN KEY → categories(id) |
|  | created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| **categories** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | name | TEXT | NOT NULL, UNIQUE |
| **orders** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
|  | status | TEXT | NOT NULL, CHECK(status IN ('pending','paid','shipped','cancelled')) |
|  | total_cents | INTEGER | NOT NULL |
|  | placed_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| **order_items** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | order_id | INTEGER | NOT NULL, FOREIGN KEY → orders(id) |
|  | product_id | INTEGER | NOT NULL, FOREIGN KEY → products(id) |
|  | quantity | INTEGER | NOT NULL |
|  | unit_price_cents | INTEGER | NOT NULL |
| **payment_methods** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
|  | type | TEXT | NOT NULL, CHECK(type IN ('card','paypal','apple_pay')) |
|  | provider_token | TEXT | NOT NULL |
|  | created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| **addresses** | id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
|  | user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) |
|  | line1 | TEXT | NOT NULL |
|  | line2 | TEXT | |
|  | city | TEXT | NOT NULL |
|  | state | TEXT | NOT NULL |
|  | postal_code | TEXT | NOT NULL |
|  | country | TEXT | NOT NULL |

These tables cover the core entities needed for user accounts, product catalog, order processing, payments, and shipping information. Adjust or extend the schema to match any additional business requirements you may have.
