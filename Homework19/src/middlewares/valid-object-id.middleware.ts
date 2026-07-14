import type { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";

export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid product id" });
    return;
  }

  next();
};
