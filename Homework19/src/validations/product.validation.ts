import Joi from "joi";

const productFields = {
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().min(3).max(1000),
  price: Joi.number().min(0),
  image: Joi.string().trim().uri(),
  category: Joi.string().trim().min(2).max(100),
};

export const createProductSchema = Joi.object({
  name: productFields.name.required(),
  description: productFields.description.required(),
  price: productFields.price.required(),
  image: productFields.image.required(),
  category: productFields.category.required(),
});

export const updateProductSchema = Joi.object(productFields).min(1);
