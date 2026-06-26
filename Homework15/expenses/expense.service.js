import ExpenseModel from "./expenses.model.js";

export const getAllExpensesService = async (query) => {
  const filter = {};
  if ("category" in query) {
    filter.category = { $in: query.category.split(",") };
  }
  if ("amountFrom" in query) {
    filter.price = {
      ...filter.price,
      $gte: Number(query.amountFrom),
    };
  }
  if ("amountTo" in query) {
    filter.price = {
      ...filter.price,
      $lte: Number(query.amountTo),
    };
  }

  const expenses = await ExpenseModel.find(filter);
  return expenses;
};

export const getTopExpensesService = async () => {
  return await ExpenseModel.find().sort({ price: -1 }).limit(5);
};

export const getExpenseByIdService = async (id) => {
  const expense = await ExpenseModel.findById(id);
  if (!expense) {
    return null;
  }

  return expense;
};

export const createExpenseService = async (body) => {
  const { category, price } = body;

  const newExpense = await ExpenseModel.create({
    category,
    price: Number(price),
  });

  return newExpense;
};

export const updateExpenseService = async (id, body) => {
  const updatedExpense = await ExpenseModel.findByIdAndUpdate(
    id,
    {
      ...body,
      $inc: { __v: 1 },
    },
    { returnDocument: "after" },
  );

  if (!updatedExpense) {
    return null;
  }

  return updatedExpense;
};
export const deleteExpenseService = async (id) => {
  const deletedExpense = await ExpenseModel.findByIdAndDelete(id);

  if (!deletedExpense) {
    return null;
  }

  return deletedExpense;
};
