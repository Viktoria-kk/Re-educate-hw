//1
const fs = require("fs/promises");
async function users() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await res.json();
  const clearedData = data.map((object) => ({
    id: object.id,
    name: object.name,
    username: object.username,
    email: object.email,
  }));

  await fs.writeFile("users.json", JSON.stringify(clearedData));
}

// users();

//4
async function counter(fileName) {
  try {
    const readData = await fs.readFile(fileName, "utf-8");
    const wordCount = readData.replace(/[ ]{2,}/g, " ").split(" ");
    const totalChars = wordCount.join("");
    const matches = totalChars.match(/[aeiou]/gi);
    const vowels = matches ? matches.length : 0;

    console.log({
      words: wordCount.length,
      chars: totalChars.length,
      vowels: vowels,
    });
  } catch (e) {
    console.log("Unknown fileName");
  }
}

// counter(process.argv[2]);
