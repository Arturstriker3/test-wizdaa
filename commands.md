# Commands

- Gerar migration: `pnpm run migration:create -- nome-da-migration`
- Criar módulo: `nest g module products`
- Criar controller: `nest g controller products`
- Criar service: `nest g service products`

<!-- CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_product_images_products
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  CONSTRAINT uq_product_images_product_id
    UNIQUE (product_id)
); -->

<!-- CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,

  CONSTRAINT fk_order_items_products
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
); -->

    <!-- `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.is_active,
      p.created_at,
      p.updated_at,
      pi.image_url
    FROM products p
    LEFT JOIN product_images pi
      ON pi.product_id = p.id
    ORDER BY p.created_at DESC
    `, -->