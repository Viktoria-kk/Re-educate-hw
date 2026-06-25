import { getAllExpensesService } from "./expense.service.js";
import { createExpenseService } from "./expense.service.js";
import { deleteExpenseService } from "./expense.service.js";

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

export const deleteExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deletedExpense = await deleteExpenseService(id);
    res.json({ success: true, data: deletedExpense });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
