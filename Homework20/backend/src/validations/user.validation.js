import Joi from "joi";
export const createUserSchema = Joi.object({ username: Joi.string().trim().min(2).max(40).required(), email: Joi.string().trim().lowercase().email().required() });
export const updateUserSchema = Joi.object({ username: Joi.string().trim().min(2).max(40).required() });
