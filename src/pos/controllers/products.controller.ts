// src/pos/controllers/products.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dto/index';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/get-user.decorator';

@Controller('products')
@UseGuards(AuthGuard(), RolesGuard) // Todas las rutas requieren autenticación
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  // Todos pueden ver productos (admin y cajero)
  findAll() {
    return this.productsService.findAll();
  }

  @Get('search')
  // Todos pueden buscar productos
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }

  @Get(':id')
  // Todos pueden ver un producto
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles('admin') // Solo admin puede crear productos
  create(@Body() createDto: CreateProductDto) {
    return this.productsService.create(createDto);
  }

  @Put(':id')
  @Roles('admin') // Solo admin puede editar productos
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('admin') // Solo admin puede eliminar productos
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
