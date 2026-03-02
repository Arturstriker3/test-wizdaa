import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async list(): Promise<Product[]> {
    return this.databaseService.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        is_active,
        created_at,
        updated_at
      FROM products
      ORDER BY created_at DESC
      `,
    );
  }

  async getById(id: string): Promise<Product> {
    const [product] = await this.databaseService.query<Product>(
      `
      SELECT
        id,
        name,
        description,
        price,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE id = $1
      `,
      [id],
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(input: CreateProductDto): Promise<Product> {
    const [product] = await this.databaseService.query<Product>(
      `
      INSERT INTO products (
        name,
        description,
        price,
        is_active
      )
      VALUES ($1, $2, $3, COALESCE($4, true))
      RETURNING
        id,
        name,
        description,
        price,
        is_active,
        created_at,
        updated_at
      `,
      [input.name, input.description ?? null, input.price, input.is_active ?? null],
    );

    return product;
  }

  async update(id: string, input: UpdateProductDto): Promise<Product> {
    const [product] = await this.databaseService.query<Product>(
      `
      UPDATE products
      SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        is_active = COALESCE($5, is_active),
        updated_at = now()
      WHERE id = $1
      RETURNING
        id,
        name,
        description,
        price,
        is_active,
        created_at,
        updated_at
      `,
      [id, input.name ?? null, input.description ?? null, input.price ?? null, input.is_active ?? null],
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async remove(id: string): Promise<void> {
    const [product] = await this.databaseService.query<{ id: string }>(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
