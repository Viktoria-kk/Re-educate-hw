import { model, Schema } from "mongoose";

export interface Product {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProductModel = model<Product>("Product", productSchema);
