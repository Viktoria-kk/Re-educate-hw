const fs = require("fs/promises");
const path = require("path");

let totalWords = 0;
let totalVowels = 0;

async function main(filePath) {
  const dirs = await fs.readdir(filePath);

  for (let dir of dirs) {
    const fullDirPath = path.join(filePath, dir);
    const stat = await fs.stat(fullDirPath);
    console.log(dir);
    if (stat.isDirectory()) {
      await main(fullDirPath);
    }
    const ext = await path.extname(fullDirPath);
    if (ext === ".txt") {
      const data = await fs.readFile(fullDirPath, "utf-8");
      const words = data.split(/\s+/);
      totalWords += words.length;
      const vowels = data.match(/[aeiouAEIOU]/g);
      totalVowels += vowels.length;
    }
  }
  return {
    words: totalWords,
    vowels: totalVowels,
  };
}

// main(__dirname).then(console.log);

//2

const http = require("http");
const url = require("url");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === "GET" && parsedUrl.pathname === "/about") {
    res.writeHead(200, { "content-type": "application/json" });

    return res.end(
      JSON.stringify({
        name: "Victoria",
        surname: "Kazarovi",
        hobby: "Reading",
      }),
    );
  }

  if (req.method === "GET" && parsedUrl.pathname === "/players") {
    const data = await fs.readFile("players.json", "utf-8");
    let players = JSON.parse(data);
    // console.log(parsedUrl);

    if (parsedUrl.query.nation) {
      players = players.filter(
        (player) => player.nation === parsedUrl.query.nation,
      );
    }

    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(players));
  }

  if (req.method === "POST" && parsedUrl.pathname === "/players") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const parsedBody = JSON.parse(body);

      if (!parsedBody.name || !parsedBody.nation || !parsedBody.position) {
        res.writeHead(400, { "content-type": "application/json" });
        return res.end(
          JSON.stringify({
            message: "All fields needed",
          }),
        );
      }

      const data = await fs.readFile("players.json", "utf-8");
      const players = JSON.parse(data);

      const lastId = players[players.length - 1]?.id || 0;

      const newPlayer = {
        id: lastId + 1,
        name: parsedBody.name,
        nation: parsedBody.nation,
        position: parsedBody.position,
      };

      players.push(newPlayer);

      await fs.writeFile("players.json", JSON.stringify(players));

      res.writeHead(201, { "content-type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Player created",
        }),
      );
    });

    return;
  }

  if (req.method === "DELETE" && parsedUrl.pathname.startsWith("/players/")) {
    const playerId = Number(parsedUrl.pathname.split("/")[2]);

    const data = await fs.readFile("players.json", "utf-8");
    const players = JSON.parse(data);

    const index = players.findIndex((player) => player.id === playerId);

    if (index === -1) {
      res.writeHead(404, { "content-type": "application/json" });
      return res.end(
        JSON.stringify({
          message: "Player not found",
        }),
      );
    }

    players.splice(index, 1);

    await fs.writeFile("players.json", JSON.stringify(players));

    res.writeHead(200, { "content-type": "application/json" });
    return res.end(
      JSON.stringify({
        message: "Player deleted",
      }),
    );
  }
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
