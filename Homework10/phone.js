const fs = require("fs/promises");

//2
async function getContacts() {
  try {
    const readData = await fs.readFile("contacts.json", "utf-8");
    return JSON.parse(readData || "[]");
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile("contacts.json", "[]");
      return [];
    }
  }
}

const [, , operation, number, name] = process.argv;

async function phoneSystem(operation, number, name) {
  if (operation === "add") {
    const contacts = await getContacts();
    if (contacts.some((contact) => contact.number === number)) {
      console.log("Number already exists");
      return;
    }
    contacts.push({ number, name });
    await fs.writeFile("contacts.json", JSON.stringify(contacts, null, 2));
  }

  if (operation === "delete") {
    const contacts = await getContacts();
    await fs.writeFile(
      "contacts.json",
      JSON.stringify(contacts.filter((contact) => contact.number !== number)),
    );
  }

  if (operation === "show") {
    const contacts = await getContacts();
    console.log(contacts);
  }
}

phoneSystem(operation, number, name);
