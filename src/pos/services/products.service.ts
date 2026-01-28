import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../dto';

@Injectable()
export class ProductsService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAll() {
    const products = await this.dataSource.query(
      'SELECT * FROM products ORDER BY id DESC',
    );
    return products.map((product) => ({
      ...product,
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
    }));
  }

  async findOne(id: number) {
    const result = await this.dataSource.query(
      'SELECT * FROM products WHERE id = $1',
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
    };
  }

  async search(query: string) {
    const products = await this.dataSource.query(
      `SELECT * FROM products 
     WHERE name ILIKE $1 OR barcode ILIKE $1 OR category ILIKE $1
     ORDER BY name`,
      [`%${query}%`],
    );

    return products.map((product) => ({
      ...product,
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
    }));
  }

  async create(createDto: CreateProductDto) {
    const { name, description, price, stock, category, barcode, image } =
      createDto;

    const result = await this.dataSource.query(
      `INSERT INTO products (name, description, price, stock, category, barcode, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, stock, category, barcode, image],
    );

    return result[0];
  }

  async update(id: number, updateDto: UpdateProductDto) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    if (updateDto.name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(updateDto.name);
    }
    if (updateDto.description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(updateDto.description);
    }
    if (updateDto.price !== undefined) {
      updates.push(`price = $${paramCounter++}`);
      values.push(updateDto.price);
    }
    if (updateDto.stock !== undefined) {
      updates.push(`stock = $${paramCounter++}`);
      values.push(updateDto.stock);
    }
    if (updateDto.category !== undefined) {
      updates.push(`category = $${paramCounter++}`);
      values.push(updateDto.category);
    }
    if (updateDto.barcode !== undefined) {
      updates.push(`barcode = $${paramCounter++}`);
      values.push(updateDto.barcode);
    }
    if (updateDto.image !== undefined) {
      updates.push(`image = $${paramCounter++}`);
      values.push(updateDto.image);
    }

    if (updates.length === 0) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.dataSource.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values,
    );

    if (result.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    return result[0];
  }

  async remove(id: number) {
    const result = await this.dataSource.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    return { message: 'Producto eliminado exitosamente' };
  }
}
