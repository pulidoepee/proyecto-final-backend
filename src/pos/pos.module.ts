import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { SalesController } from './controllers/sales.controller';
import { ProductsService } from './services/products.service';
import { SalesService } from './services/sales.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController, SalesController],
  providers: [ProductsService, SalesService],
})
export class PosModule {}
