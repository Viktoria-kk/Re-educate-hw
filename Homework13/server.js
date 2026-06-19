import express from "express";
import { readFile } from "./utils/read-file.js";
import { writeFile } from "./utils/write-file.js";

const port = 4000;
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Expense API is running");
});

app.get("/expenses", async (req, res) => {
  try {
    const expenses = await readFile("expenses.json", true);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const take = Math.min(Number(req.query.take) || 30, 30);

    const start = (page - 1) * take;
    const end = start + take;

    const result = expenses.slice(start, end);

    res.status(200).json({
      page,
      take,
      total: expenses.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.post("/expenses", async (req, res) => {
  try {
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

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const secret = req.headers.secret;
    if (!secret || secret !== "random123") {
      return res.status(401).json({
        message: "You need a right secret code to delete an expense!",
      });
    }
    const id = Number(req.params.id);

    let expenses = await readFile("expenses.json", true);

    if (!expenses.some((e) => e.id === id)) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    expenses = expenses.filter((e) => e.id !== id);

    await writeFile("expenses.json", expenses);

    res.json({
      message: "Expense deleted Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
