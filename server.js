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
});

// Load questions.json and parse it as JSON
let questions = [];

fs.readFile('./questions.json', 'utf8', (err, data) => {
  if (err) {
    console.error("Error loading questions.json", err);
    return;
  }
  questions = JSON.parse(data);
  console.log("Questions loaded successfully");
});

// GET route to return a random question based on label selection
app.get('/get-question', (req, res) => {
  const { selection } = req.query; // Expecting a query param like ?selection=tech

  if (questions.length > 0) {

    let filteredQuestions = questions

    if (selection) {
      // Filter questions based on label matching the user selection
      filteredQuestions = questions.filter(question => question.labels.includes(selection.toLowerCase()));
    }
    
    if (filteredQuestions.length > 0) {
      // Select a random question from the filtered list
      const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      res.json(randomQuestion);
    } else {
      res.status(404).send("No questions available for the selected label");
    }
  } else {
    res.status(500).send("No questions available");
  }
});

// NOTE: The below AI functions are currently being developed

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
/*
const apiToken = process.env.HUGGING_FACE_API_TOKEN;
const { HfInference } = require('@huggingface/inference')
const hf = new HfInference(apiToken)
const API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B"; // Replace with the desired model

app.get('/generate-sentence', async (req, res) => {
  const prompt = "Generate a sentence that uses corporate lingo in the workplace.";
  
  try {
    const response = await hf.textGeneration({
      model: 'gpt2',  // Replace with a better model like GPT-3 if available
      inputs: prompt,
      parameters: { max_length: 50 } // Customize max length if needed
    });

    console.log(response);
    
    // Extract the generated text from the response
    const generatedText = response.generated_text;

    res.json({
      generatedText
    });
  } catch (error) {
    console.error("Error generating sentence:", error);
    res.status(500).send("Error generating sentence");
  }
});

app.get("/get-prompt", async (req, res) => {
  var prompt = `
    Generate a work scenario in the technology industry using corporate lingo. 
    Follow these steps:
    1. Write a scenario sentence with one key word replaced by "____".
    2. Provide the correct answer (the word that fits in the blank).
    3. Provide three incorrect but plausible answer choices.

    Use this exact format:
    Scenario: [Full sentence with ____]
    Correct Answer: [Word that fits in the blank]
    Incorrect Choices: [Wrong word 1], [Wrong word 2], [Wrong word 3]
  `;

  prompt = "Give me an example of a sentence using corporate lingo in workspace in technology sector"

  const fetchWithRetry = async (attempts = 3) => {
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
        console.log(generatedText);
        const { scenario, correctAnswer, incorrectChoices } = parseOutput(generatedText);
        res.json({ scenario, correctAnswer, incorrectChoices });
      } else if (result.error && result.error.includes('currently loading')) {
        if (attempts > 0) {
          const waitTime = result.estimated_time || 60;  // Default to 60 seconds if no estimate is provided
          console.log(`Model is loading, retrying in ${waitTime} seconds...`);
          setTimeout(() => fetchWithRetry(attempts - 1), waitTime * 1000);  // Wait and retry
        } else {
          res.status(500).send("Model still loading after multiple attempts");
        }
      } else {
        throw new Error(result.error || "Error generating text");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      res.status(500).send("Error generating prompt");
    }
  };

  fetchWithRetry(); // Initiate the first fetch attempt
});

function parseOutput(output) {
  // Basic parsing for a structured format
  const scenarioMatch = output.match(/Scenario:\s*"(.+?)"/);
  const correctAnswerMatch = output.match(/Correct Answer:\s*(.+?)/);
  const incorrectChoicesMatch = output.match(/Incorrect Choices:\s*(.+)/);

  return {
    scenario: scenarioMatch ? scenarioMatch[1] : "No scenario found",
    correctAnswer: correctAnswerMatch ? correctAnswerMatch[1] : "No correct answer",
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
