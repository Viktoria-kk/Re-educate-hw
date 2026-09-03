import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        { provide: getModelToken('product'), useValue: {} },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
