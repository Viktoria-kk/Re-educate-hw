const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const expensesPath = path.join(__dirname, "data", "expenses.json");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const readExpenses = async () => {
  const data = await fs.readFile(expensesPath, "utf-8");
  return JSON.parse(data);
};

const writeExpenses = async (expenses) => {
  await fs.writeFile(expensesPath, JSON.stringify(expenses, null, 2));
};

app.get("/", async (req, res, next) => {
  try {
    const category = req.query.category?.trim() || "";
    const expenses = await readExpenses();
    const filteredExpenses = category
      ? expenses.filter((expense) =>
          expense.category.toLowerCase().includes(category.toLowerCase()),
        )
      : expenses;

    res.render("pages/home.ejs", {
      title: "Expenses",
      metaData: "Expenses page",
      expenses: filteredExpenses,
      category,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/create-expense", (req, res) => {
  res.render("pages/create-expense.ejs", {
    title: "Create expense",
    metaData: "Create a new expense",
    error: "",
    expense: {},
  });
});

app.get("/expenses/:id", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const expense = expenses.find(
      (expense) => expense.id === Number(req.params.id),
    );
    if (!expense) return res.status(404).send("Expense not found");
    res.render("pages/expense-details.ejs", {
      title: "Expense details",
      metaData: "Expense details page",
      expense,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/expenses/:id/update", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const expense = expenses.find(
      (expense) => expense.id === Number(req.params.id),
    );
    if (!expense) return res.status(404).send("Expense not found");
    res.render("pages/expense-edit.ejs", {
      title: "Update expense",
      metaData: "Update expense page",
      expense,
      error: "",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/expenses", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const category = req.query.category?.trim();
    const result = category
      ? expenses.filter((expense) =>
          expense.category.toLowerCase().includes(category.toLowerCase()),
        )
      : expenses;
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/expenses/:id", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const expense = expenses.find(
      (expense) => expense.id === Number(req.params.id),
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

app.post("/api/expenses", async (req, res, next) => {
  try {
    const { category, price } = req.body;
    const numericPrice = Number(price);
    if (
      !category?.trim() ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).render("pages/create-expense.ejs", {
        title: "Create expense",
        metaData: "Create a new expense",
        error: "Please enter a category and a valid price.",
        expense: req.body,
      });
    }

    const expenses = await readExpenses();
    const lastId = expenses.length
      ? Math.max(...expenses.map((expense) => expense.id))
      : 0;
    const newExpense = {
      id: lastId + 1,
      category: category.trim(),
      price: numericPrice,
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    await writeExpenses(expenses);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/api/expenses/:id/delete", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const index = expenses.findIndex(
      (expense) => expense.id === Number(req.params.id),
    );
    if (index === -1) return res.status(404).send("Expense not found");
    expenses.splice(index, 1);
    await writeExpenses(expenses);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.post("/api/expenses/:id/update", async (req, res, next) => {
  try {
    const expenses = await readExpenses();
    const index = expenses.findIndex(
      (expense) => expense.id === Number(req.params.id),
    );
    if (index === -1) return res.status(404).send("Expense not found");

    const updateRequest = {};
    if (req.body.category?.trim())
      updateRequest.category = req.body.category.trim();
    if (
      req.body.price !== "" &&
      Number.isFinite(Number(req.body.price)) &&
      Number(req.body.price) >= 0
    ) {
      updateRequest.price = Number(req.body.price);
    }
    expenses[index] = {
      ...expenses[index],
      ...updateRequest,
      updatedAt: new Date().toISOString(),
    };
    await writeExpenses(expenses);
    res.redirect(`/expenses/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Something went wrong");
});

app.listen(3000, () => {
  console.log("server running on http://localhost:3000");
});
