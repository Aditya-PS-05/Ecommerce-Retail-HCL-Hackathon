# E-Commerce Retail Portal - ER Diagram

## Database Entities (MongoDB)

```
+------------------+       +------------------+
|      USERS       |       |    CATEGORIES    |
+------------------+       +------------------+
| _id (PK)         |       | _id (PK)         |
| email (unique)   |       | name             |
| name             |       | description      |
| password_hash    |       | logo_url         |
| role             |       | is_active        |
| created_at       |       | created_at       |
+--------+---------+       +--------+---------+
         |                          |
         | 1:N                      | 1:N
         v                          v
+------------------+       +------------------+
|    CART_ITEMS    |       |     PRODUCTS     |
+------------------+       +------------------+
| _id (PK)         |       | _id (PK)         |
| user_id (FK) ----+---->  | name             |
| product_id (FK) -+------>| description      |
| quantity         |       | price            |
| selected_addons  |       | tax_percent      |
| created_at       |       | image_url        |
+------------------+       | category_id (FK)-+---->
                           | stock            |
         +-----------------+ is_combo         |
         |                 | combo_items[]    |
         |                 | add_ons[]        |
         |                 | is_active        |
         |                 +------------------+
         |
         | 1:N
         v
+------------------+
|      ORDERS      |
+------------------+
| _id (PK)         |
| user_id (FK) ----+---> USERS
| items[]          |
|   - product_id --+---> PRODUCTS
|   - quantity     |
|   - price        |
|   - tax          |
| subtotal         |
| total_tax        |
| total            |
| status           |
| created_at       |
+------------------+
```

## Relationships

| From | Relation | To |
|------|----------|-----|
| USERS | 1 : N | ORDERS |
| USERS | 1 : N | CART_ITEMS |
| CATEGORIES | 1 : N | PRODUCTS |
| PRODUCTS | 1 : N | CART_ITEMS |
| PRODUCTS | 1 : N | ORDER_ITEMS |
