import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    req.body = value;
    next();
  };
