import type { NextFunction, Request, Response } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = req.header("role");

  if (role?.toLowerCase() !== "admin") {
    res.status(403).json({
      message: "Only an admin can update or delete a product",
    });
    return;
  }

  next();
};
