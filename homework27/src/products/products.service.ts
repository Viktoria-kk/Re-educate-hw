import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('product') private readonly productModel: Model<Product>,
  ) {}

  create(createProductDto: CreateProductDto, userId: string) {
    return this.productModel.create({
      ...createProductDto,
      owner: new Types.ObjectId(userId),
    });
  }

  findAll(userId: string) {
    return this.productModel.find({ owner: new Types.ObjectId(userId) });
  }

  async findOne(productId: string, userId: string) {
    const product = await this.productModel.findOne({
      _id: productId,
      owner: new Types.ObjectId(userId),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    productId: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ) {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { _id: productId, owner: new Types.ObjectId(userId) },
      { ...updateProductDto, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async remove(productId: string, userId: string) {
    const deletedProduct = await this.productModel.findOneAndDelete({
      _id: productId,
      owner: new Types.ObjectId(userId),
    });

    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }

    return deletedProduct;
  }
}
