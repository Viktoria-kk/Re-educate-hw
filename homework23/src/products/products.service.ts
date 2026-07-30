import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private nextId = 1;

  create(createProductDto: CreateProductDto): Product {
    const newProduct: Product = {
      id: this.nextId++,
      ...createProductDto,
    };

    this.products.push(newProduct);
    return newProduct;
  }

  findAll(isActiveSubscriber = false): Product[] {
    if (!isActiveSubscriber) {
      return this.products;
    }

    return this.products.map((product) => ({
      ...product,
      price: Number((product.price * 0.9).toFixed(2)),
    }));
  }

  findOne(productId: number): Product {
    const product = this.products.find((item) => item.id === productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  update(productId: number, updateProductDto: UpdateProductDto): Product {
    const index = this.products.findIndex((item) => item.id === productId);

    if (index === -1) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    this.products[index] = {
      ...this.products[index],
      ...updateProductDto,
    };

    return this.products[index];
  }

  remove(productId: number): Product {
    const index = this.products.findIndex((item) => item.id === productId);

    if (index === -1) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const [deletedProduct] = this.products.splice(index, 1);
    return deletedProduct;
  }
}
