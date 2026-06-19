#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "./utils/read-file.js";
import { writeFile } from "./utils/write-file.js";

const program = new Command();

program.name("Expenses Cli").description("Expenses CLI app").version("1.0.0");

program
  .command("add")
  .description("this command adds an expense")
  .argument("<category>", "expense category field")
  .argument("<price>", "expense price field")
  .action(async (category, price) => {
    console.log("1");
    const expenses = (await readFile("./expenses.json", true)) || [];
    const lastId = expenses[expenses.length - 1]?.id || 0;
    const parsedPrice = Number(price);

    if (parsedPrice < 10) {
      console.log("Error: price must be at least 10");
      return;
    }

    const newExpense = {
      id: lastId + 1,
      category,
      price: parsedPrice,
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);

    await writeFile("./expenses.json", expenses);

    console.log("Expense added successfully");
  });

program
  .command("show")
  .description("show all expenses")
  .option("-c, --category <category>", "filter by category")
  .option("-p, --page <page>", "page number")
  .option("-l, --limit <limit>", "number expenses per page")
  .option("--asc", "sort by ascending date")
  .option("--desc", "sort by descending date")
  .action(async (options) => {
    let expenses = (await readFile("./expenses.json", true)) || [];

    if (options.category) {
      expenses = expenses.filter(
        (expense) => expense.category === options.category,
      );
    }

    if (options.asc) {
      expenses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (options.desc) {
      expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 5;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = expenses.slice(start, end);

    console.table(paginated);
  });

program
  .command("update <id>")
  .description("update expense by id")
  .option("-c, --category <category>", "update category")
  .option("-p, --price <price>", "update price")
  .action(async (id, options) => {
    const expenses = (await readFile("./expenses.json", true)) || [];

    const index = expenses.findIndex((e) => e.id === Number(id));

    if (index === -1) {
      console.log("Expense not found");
      return;
    }

    if (options.category) {
      expenses[index].category = options.category;
    }

    if (options.price) {
      const parsedPrice = Number(options.price);

      if (parsedPrice < 10) {
        console.log("Error: price must be at least 10");
        return;
      }

      expenses[index].price = parsedPrice;
    }

    await writeFile("./expenses.json", expenses);

    console.log("Expense updated successfully");
  });

program
  .command("get <id>")
  .description("get expense by id")
  .action(async (id) => {
    const expenses = (await readFile("./expenses.json", true)) || [];

    const index = expenses.findIndex((e) => e.id === Number(id));

    if (index === -1) {
      console.log("Expense not found");
      return;
    }

    console.log(expenses[index]);
  });

program
  .command("delete <id>")
  .description("delete expense")
  .action(async (id) => {
    const expenses = (await readFile("./expenses.json", true)) || [];

    const filtered = expenses.filter((e) => e.id !== Number(id));

    await writeFile("./expenses.json", filtered);

    console.log("Expense deleted");
  });

program
  .command("search <date>")
  .description("search expenses by date")
  .action(async (date) => {
    const expenses = (await readFile("./expenses.json", true)) || [];

    const result = expenses.filter((e) => e.createdAt.startsWith(date));

    console.table(result);
  });

program.parse();
