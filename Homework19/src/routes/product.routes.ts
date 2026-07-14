import { Router } from "express";
import { requireAdmin } from "../middlewares/admin-role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateObjectId } from "../middlewares/valid-object-id.middleware.js";
import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";

export const productRouter = Router();

productRouter.post("/", validate(createProductSchema), async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: "Could not create product" });
  }
});

productRouter.get("/", async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not get products" });
  }
});

productRouter.get("/:id", validateObjectId, async (req, res) => {
  try {
    const product = await getProductById(String(req.params.id));

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch {
    res.status(500).json({ message: "Could not get product" });
  }
});

productRouter.put(
  "/:id",
  requireAdmin,
  validateObjectId,
  validate(updateProductSchema),
  async (req, res) => {
    try {
      const product = await updateProduct(String(req.params.id), req.body);

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.json(product);
    } catch {
      res.status(500).json({ message: "Could not update product" });
    }
  },
);

productRouter.delete(
  "/:id",
  requireAdmin,
  validateObjectId,
  async (req, res) => {
    try {
      const product = await deleteProductById(String(req.params.id));

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      res.json({ message: "Product deleted successfully" });
    } catch {
      res.status(500).json({ message: "Could not delete product" });
    }
  },
);
