import { readFile } from "../utils/read-file.js";
import { writeFile } from "../utils/write-file.js";

export const getAllExpensesService = async (query) => {
  const expenses = await readFile("expenses.json", true);

  const page = Math.max(Number(query.page) || 1, 1);
  const take = Math.min(Number(query.take) || 30, 30);

  const start = (page - 1) * take;
  const end = start + take;

  const result = expenses.slice(start, end);

  return { page, take, total: expenses.length, data: result };
};

export const createExpenseService = async (body) => {
  const { category, price } = body;

  const expenses = await readFile("expenses.json", true);
  const lastId = expenses[expenses.length - 1]?.id || 0;

  const newExpense = {
    id: lastId + 1,
    category,
    price: Number(price),
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);
  await writeFile("expenses.json", expenses);

  return newExpense;
};

export const deleteExpenseService = async (id) => {
  let expenses = await readFile("expenses.json", true);
  const index = expenses.findIndex((user) => user.id === id);
  if (index === -1) {
    return null;
  }
  const deletedExpense = expenses.splice(index, 1);
  expenses = expenses.filter((e) => e.id !== id);
  await writeFile("expenses.json", expenses);
  return deletedExpense[0];
};
