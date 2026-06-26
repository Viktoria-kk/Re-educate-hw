export const validateExpense = (req, res, next) => {
  const { category, price } = req.body;
  if (!category || !price) {
    return res.status(400).json({
      message: "category and price are required",
    });
  }
  if (Number(price) < 10) {
    return res.status(400).json({
      message: "price must be at least 10",
    });
  }

  next();
};
