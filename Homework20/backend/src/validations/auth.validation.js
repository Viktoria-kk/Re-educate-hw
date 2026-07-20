import Joi from "joi";
export const signUpSchema = Joi.object({ username: Joi.string().trim().min(2).max(40).required(), email: Joi.string().trim().lowercase().email().required(), password: Joi.string().min(6).max(72).required() });
export const signInSchema = Joi.object({ email: Joi.string().trim().lowercase().email().required(), password: Joi.string().min(6).max(72).required() });
