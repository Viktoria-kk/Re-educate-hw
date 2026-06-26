import {
  getAllExpensesService,
  getExpenseByIdService,
  updateExpenseService,
  createExpenseService,
  deleteExpenseService,
} from "./expense.service.js";

export const getAllExpenses = async (req, res) => {
  try {
    const result = await getAllExpensesService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getTopExpenses = async (req, res) => {
  try {
    const result = await getAllExpensesService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const result = await getExpenseByIdService(req.params.id);
    if (!result) {
      return res.status(400).json({
        message: "Expense not found",
      });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createExpense = async (req, res) => {
  try {
    const newExpense = await createExpenseService(req.body);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const updatedExpense = await updateExpenseService(req.params.id, req.body);
    if (!updatedExpense) {
      return res.status(400).json({
        message: "Expense not found",
      });
    }
    res.json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
export const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await deleteExpenseService(req.params.id);
    if (!deletedExpense) {
      return res.status(400).json({
        message: "Expense not found",
      });
    }
    res.json({ success: true, data: deletedExpense });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
