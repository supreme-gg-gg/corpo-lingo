const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

app.get("/cards", (req, res) => {
  const filePath = path.join(__dirname, "cards.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading file");
      return;
    }
    try {
      const cards = JSON.parse(data);
      const shuffledCards = cards.sort(() => 0.5 - Math.random());
      const selectedCards = shuffledCards.slice(0, 5);
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(selectedCards));
    } catch (parseErr) {
      res.status(500).send("Error parsing JSON");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
