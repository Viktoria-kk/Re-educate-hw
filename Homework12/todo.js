#!/usr/bin/env node

import { Command } from "commander";
import { readFile } from "./utils/read-file.js";
import { writeFile } from "./utils/write-file.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "todos.json");

const program = new Command();

program.command("show").action(async () => {
  const todos = await readFile(FILE_PATH, true);
  console.log(todos);
});

program.command("add <title>").action(async (title) => {
  const todos = await readFile(FILE_PATH, true);

  const newTodo = {
    id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
    title,
    isDone: false,
  };

  todos.push(newTodo);

  await writeFile(FILE_PATH, todos);

  console.log(newTodo);
});

program.command("delete <id>").action(async (id) => {
  const todos = await readFile(FILE_PATH, true);

  const todoExists = todos.some((t) => t.id === Number(id));

  if (!todoExists) {
    return console.log("Todo not found");
  }

  const deleted = todos.find((t) => t.id === Number(id));

  const updatedTodos = todos.filter((t) => t.id !== Number(id));

  await writeFile(FILE_PATH, updatedTodos);

  console.log(deleted);
});

program
  .command("update <id>")
  .option("--name <title>")
  .option("--done")
  .action(async (id, opts) => {
    const todos = await readFile(FILE_PATH, true);

    const todo = todos.find((t) => t.id === Number(id));

    if (!todo) {
      return console.log("Todo not found");
    }

    if (opts.name) {
      todo.title = options.name;
    }
    if (opts.done) {
      todo.isDone = true;
    }

    await writeFile(FILE_PATH, todos);

    console.log(todo);
  });

program.parse();
