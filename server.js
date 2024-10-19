const express = require("express");
const fs = require("fs");
const socketIo = require("socket.io");
const http = require("http");
const path = require("path");
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, "public")));

/*
const { pipeline } = require('stream');
const { Transformers, AutoModelForCausalLM, AutoTokenizer } = require('transformers');
const modelName = "gpt2"; // Replace with your chosen model
const tokenizer = AutoTokenizer.fromPretrained(modelName);
const model = AutoModelForCausalLM.fromPretrained(modelName);
*/

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

app.get("/cards", (req, res) => {
  try {
    const shuffledCards = cards.sort(() => 0.5 - Math.random());
    const selectedCards = shuffledCards.slice(0, 5);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(selectedCards));
  } catch (parseErr) {
    res.status(500).send("Error parsing JSON");
  }
})

var selections = ""

app.post('/store-selection', (req, res) => {
    const userSelections = req.body; // Access the JSON data
    
    // Here, you can directly access the selections array
    selections = userSelections.selections;

    // Log the selections for debugging
    console.log('User selections:', selections);

    // Send a response back to the client
    res.status(200).json({ message: 'Selections stored successfully!' });
});

require('dotenv').config();
const apiToken = process.env.HUGGING_FACE_API_TOKEN;
const API_URL = "https://api-inference.huggingface.co/models/gpt2"; // Replace with the desired model

app.get("/get-prompt", async (req, res) => {
  const prompt = `
        Generate a work scenario in the ${selections} industry using corporate lingo. 
        Include a sentence with one word replaced by a blank (represented as "____"). 
        Provide one correct answer and three incorrect answer choices. 
        Format your response as follows:
        
        Scenario: "In our team meeting, we need to focus on ____ to enhance our productivity.'"
        Correct Answer: [correct answer]
        Incorrect Choices: [incorrect answer 1], [incorrect answer 2], [incorrect answer 3]
    `;
    
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const result = await response.json();
    if (response.ok) {
      const generatedText = result[0].generated_text; // Modify based on the API response structure
      const { scenario, correctAnswer, incorrectChoices } = parseOutput(generatedText);
      res.json({ scenario, correctAnswer, incorrectChoices });
    } else {
      throw new Error(result.error || "Error generating text");
    }
  } catch (error) {
    console.error("Error generating prompt:", error);
    res.status(500).send("Error generating prompt");
  }
});

function parseOutput(output) {
  const scenarioMatch = output.match(/Scenario:\s*"(.+?)"/);
  const correctAnswerMatch = output.match(/Correct Answer:\s*(.+?)/);
  const incorrectChoicesMatch = output.match(/Incorrect Choices:\s*(.+)/);

  return {
    scenario: scenarioMatch ? scenarioMatch[1] : null,
    correctAnswer: correctAnswerMatch ? correctAnswerMatch[1] : null,
    incorrectChoices: incorrectChoicesMatch ? incorrectChoicesMatch[1].split(', ') : []
  };
}

/*
app.post('/get-prompt', async (req, res) => {

    const prompt = `
        Generate a work scenario in the ${selectionsStorage} industry using corporate lingo. 
        Include a sentence with one word replaced by a blank (represented as "____"). 
        Provide one correct answer and three incorrect answer choices. 
        Format your response as follows:
        
        Scenario: "Here is the sentence with a blank: 'In our team meeting, we need to focus on ____ to enhance our productivity.'"
        Correct Answer: [correct answer]
        Incorrect Choices: [incorrect answer 1], [incorrect answer 2], [incorrect answer 3]
    `;
  
    // Tokenize the input and generate a response
    const inputIds = tokenizer.encode(prompt, { return_tensors: 'pt' });
    const output = await model.generate(inputIds, { max_length: 50 }); // Adjust max_length as needed

    const generatedText = tokenizer.decode(output[0], { skip_special_tokens: true });

    // Process the generated text to create the response
    const [sentenceWithBlank, correctAnswer, wrongAnswers] = parseOutput(generatedText);

    res.json({ sentence: sentenceWithBlank, correct: correctAnswer, options: wrongAnswers });
});

function parseOutput(output) {
    const scenarioMatch = output.match(/Scenario:\s*"(.+?)"/);
    const correctAnswerMatch = output.match(/Correct Answer:\s*(.+?)/);
    const incorrectChoicesMatch = output.match(/Incorrect Choices:\s*(.+)/);

    return {
        scenario: scenarioMatch ? scenarioMatch[1] : null,
        correctAnswer: correctAnswerMatch ? correctAnswerMatch[1] : null,
        incorrectChoices: incorrectChoicesMatch ? incorrectChoicesMatch[1].split(', ') : []
    };
}
*/

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

    game.players.forEach((player, index) => {
      player.emit("answerResult", {
          correct,
          selectedWord: answer,
          correctWord: game.cards[game.currentWord].word,
          score: game.scores[playerIndex],
          currentPlayer: playerIndex,
      });
    });

    // Move to the next word if the answer was correct
    if (correct) {
      // Wait for a moment before moving to the next question
      setTimeout(() => {
        if (game.currentWord < game.cards.length - 1) {
          game.currentWord++;
          sendNextWord(gameId);
        } else {
          endGame(gameId);
        }
      }, 1300); // 1 second + 0.3 seconds of animation
    }
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

    const opponentIndex = index === 0 ? 1 : 0;

    player.emit("newWord", {
      definition: currentWord.definition,
      options,
      score: game.scores[index],
      opponentScore: game.scores[opponentIndex]
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
