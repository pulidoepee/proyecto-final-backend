import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateSaleDto } from '../dto/index';

@Injectable()
export class SalesService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAll() {
    const sales = await this.dataSource.query(
      `SELECT * FROM sales ORDER BY created_at DESC`,
    );

    return Promise.all(
      sales.map(async (sale: any) => {
        const items = await this.dataSource.query(
          `SELECT si.*, p.name, p.description 
           FROM sale_items si
           JOIN products p ON si.product_id = p.id
           WHERE si.sale_id = $1`,
          [sale.id],
        );

        return {
          id: sale.id,
          total: parseFloat(sale.total),
          paymentMethod: sale.payment_method,
          customerId: sale.customer_id,
          status: sale.status,
          date: sale.created_at,
          clientName: sale.client_name,
          clientDocumentId: sale.client_document_id,
          clientContact: sale.client_contact,
          items: items.map((item: any) => ({
            product: {
              id: item.product_id,
              name: item.name,
              description: item.description,
              price: parseFloat(item.price),
            },
            quantity: item.quantity,
            subtotal: parseFloat(item.subtotal),
          })),
        };
      }),
    );
  }

  async findOne(id: number) {
    const saleResult = await this.dataSource.query(
      'SELECT * FROM sales WHERE id = $1',
      [id],
    );

    if (saleResult.length === 0) {
      throw new NotFoundException('Venta no encontrada');
    }

    const sale = saleResult[0];

    const items = await this.dataSource.query(
      `SELECT si.*, p.name, p.description 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [id],
    );

    return {
      id: sale.id,
      total: parseFloat(sale.total),
      paymentMethod: sale.payment_method,
      customerId: sale.customer_id,
      status: sale.status,
      date: sale.created_at,
      clientName: sale.client_name,
      clientDocumentId: sale.client_document_id,
      clientContact: sale.client_contact,
      items: items.map((item: any) => ({
        product: {
          id: item.product_id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
        },
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal),
      })),
    };
  }

  // src/pos/services/sales.service.ts
  // Solo la parte del método create actualizada

  async create(createDto: CreateSaleDto) {
    const {
      items,
      paymentMethod,
      customerId,
      clientName,
      clientDocumentId,
      clientContact,
      cardLastFour,
      cardType,
      cardHolderName,
    } = createDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un producto');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      const itemsData = [];

      for (const item of items) {
        const productResult = await queryRunner.query(
          'SELECT * FROM products WHERE id = $1',
          [item.productId],
        );

        if (productResult.length === 0) {
          throw new NotFoundException(
            `Producto ${item.productId} no encontrado`,
          );
        }

        const product = productResult[0];

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
          );
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;

        itemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        });
      }

      const saleResult = await queryRunner.query(
        `INSERT INTO sales (
        total, 
        payment_method, 
        customer_id, 
        status, 
        client_name, 
        client_document_id, 
        client_contact,
        card_last_four,
        card_type,
        card_holder_name
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
        [
          total,
          paymentMethod,
          customerId,
          'completed',
          clientName,
          clientDocumentId,
          clientContact,
          cardLastFour || null,
          cardType || null,
          cardHolderName || null,
        ],
      );

      const saleId = saleResult[0].id;

      for (const item of itemsData) {
        await queryRunner.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
          [saleId, item.productId, item.quantity, item.price, item.subtotal],
        );

        await queryRunner.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.productId],
        );
      }

      await queryRunner.commitTransaction();

      return {
        id: saleResult[0].id,
        total: parseFloat(saleResult[0].total),
        paymentMethod: saleResult[0].payment_method,
        customerId: saleResult[0].customer_id,
        status: saleResult[0].status,
        date: saleResult[0].created_at,
        clientName: saleResult[0].client_name,
        clientDocumentId: saleResult[0].client_document_id,
        clientContact: saleResult[0].client_contact,
        cardLastFour: saleResult[0].card_last_four,
        cardType: saleResult[0].card_type,
        cardHolderName: saleResult[0].card_holder_name,
        items: itemsData,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByDateRange(startDate: string, endDate: string) {
    return this.dataSource.query(
      `SELECT * FROM sales 
       WHERE created_at >= $1 AND created_at <= $2
       ORDER BY created_at DESC`,
      [startDate, endDate],
    );
  }
}
