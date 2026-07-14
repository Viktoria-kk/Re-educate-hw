import { ProductModel, type Product } from "../models/product.model.js";

export type CreateProductData = Product;
export type UpdateProductData = Partial<Product>;

export const createProduct = (productData: CreateProductData) =>
  ProductModel.create(productData);

export const getProducts = () => ProductModel.find();

export const getProductById = (productId: string) =>
  ProductModel.findById(productId);

export const updateProduct = (
  productId: string,
  productData: UpdateProductData,
) =>
  ProductModel.findByIdAndUpdate(productId, productData, {
    new: true,
    runValidators: true,
  });

export const deleteProductById = (productId: string) =>
  ProductModel.findByIdAndDelete(productId);
