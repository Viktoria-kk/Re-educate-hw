const fs = require("fs/promises");

//3
async function getCars() {
  try {
    const readData = await fs.readFile("cars.json", "utf-8");
    return JSON.parse(readData || "[]");
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile("cars.json", "[]");
      return [];
    }
  }
}
const [, , operation, name, year, color] = process.argv;

async function cars(operation, name, year, color) {
  if (operation === "add") {
    const readData = await getCars();
    readData.push({ carName: name, carYear: year, carColor: color });
    await fs.writeFile("cars.json", JSON.stringify(readData));
  } else if (operation === "show") {
    const readData = await getCars();
    console.log(
      readData.filter(
        (object) => object.carColor == name || object.carYear == Number(name),
      ),
    );
  } else {
    console.log(`${operation} is not an operation`);
    return;
  }
}

cars(operation, name, year, color);
