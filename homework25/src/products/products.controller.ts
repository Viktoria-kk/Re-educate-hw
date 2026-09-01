import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsValidObjectId } from '../common/dto/is-valid-object-id.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUserId() userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.productsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param() { id }: IsValidObjectId, @CurrentUserId() userId: string) {
    return this.productsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param() { id }: IsValidObjectId,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUserId() userId: string,
  ) {
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  remove(@Param() { id }: IsValidObjectId, @CurrentUserId() userId: string) {
    return this.productsService.remove(id, userId);
  }
}
