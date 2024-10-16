const express = require("express");
const fs = require("fs");
const socketIo = require("socket.io");
const http = require("http");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server);

// Variable to hold the card data
let cards = [];

// Load cards.json once on server startup
fs.readFile(path.join(__dirname, "cards.json"), "utf8", (err, data) => {
  if (err) {
    console.error("Error reading cards.json:", err);
    process.exit(1); // Exit the process if loading fails
  }
  try {
    cards = JSON.parse(data);
    console.log("Cards loaded successfully");
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
    process.exit(1); // Exit the process if parsing fails
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/cards", (req, res) => {
  try {
    const shuffledCards = cards.sort(() => 0.5 - Math.random());
    const selectedCards = shuffledCards.slice(0, 5);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(selectedCards));
  } catch (parseErr) {
    res.status(500).send("Error parsing JSON");
  }
});

const waitingPlayers = [];
const activeGames = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", () => {
    if (waitingPlayers.length > 0) {
      const opponent = waitingPlayers.pop();
      const gameId = `${socket.id}-${opponent.id}`;
      const game = {
        players: [socket, opponent],
        scores: [0, 0],
        currentWord: 0,
        cards: shuffleArray([...cards]).slice(0, 20),
      };
      activeGames.set(gameId, game);

      socket.emit("gameStart", { gameId, playerIndex: 0 });
      opponent.emit("gameStart", { gameId, playerIndex: 1 });

      sendNextWord(gameId);
    } else {
      waitingPlayers.push(socket);
      socket.emit("waiting");
    }
  });

  socket.on("answer", ({ gameId, answer, time }) => {
    const game = activeGames.get(gameId);
    if (!game) return;

    const playerIndex = game.players.indexOf(socket);
    if (playerIndex === -1) return;

    const correct = answer === game.cards[game.currentWord].word;
    game.scores[playerIndex] += correct ? 1 : 0;

    socket.emit("answerResult", { correct, selectedWord: answer, correctWord: game.cards[game.currentWord].word, score: game.scores[playerIndex] });

    // Wait for a moment before moving to the next question
    setTimeout(() => {
      if (game.currentWord < 19) {
        game.currentWord++;
        sendNextWord(gameId);
      } else {
        endGame(gameId);
      }
    }, 1300); // 1 second + 0.3 seconds of animation
  });

  socket.on("disconnect", () => {
    const waitingIndex = waitingPlayers.indexOf(socket);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    for (const [gameId, game] of activeGames.entries()) {
      if (game.players.includes(socket)) {
        endGame(gameId, true);
      }
    }
  });
});

function sendNextWord(gameId) {
  const game = activeGames.get(gameId);
  const currentWord = game.cards[game.currentWord];
  const options = getRandomOptions(currentWord.word, cards);

  game.players.forEach((player, index) => {
    player.emit("newWord", {
      definition: currentWord.definition,
      options,
      score: game.scores[index],
    });
  });
}

function endGame(gameId, aborted = false) {
  const game = activeGames.get(gameId);
  if (!game) return;

  const winner = game.scores[0] > game.scores[1] ? 0 : 1;
  game.players.forEach((player, index) => {
    player.emit("gameEnd", {
      winner,
      aborted,
      finalScore: game.scores[index],
    });
  });

  activeGames.delete(gameId);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomOptions(correctWord, allCards) {
  const options = [correctWord];
  while (options.length < 4) {
    const randomWord =
      allCards[Math.floor(Math.random() * allCards.length)].word;
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }
  return shuffleArray(options);
}

server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
