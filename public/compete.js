const socket = io();

let gameId = null;
let playerIndex = null;
let cards = []; // Array to hold the cards for matching
let matchedPairs = 0;
let totalPairs = 0;
let selectedWord = null;
let selectedDefinition = null;

document.getElementById("compete-button").addEventListener("click", () => {
  socket.emit("joinGame");
  document.getElementById("waiting-screen").style.display = "block";
  document.getElementById("home-screen").style.display = "none";
});

// Function to fetch cards from the backend
function fetchCards() {
  fetch("/cards")
    .then((response) => response.json())
    .then((data) => {
      cards = data;
      totalPairs = cards.length;
      // Start the game after fetching cards
      socket.emit("startGame", { cards });
    })
    .catch((error) => {
      console.error("Error fetching cards:", error);
    });
}

socket.on("waiting", () => {
  document.getElementById("waiting-message").textContent =
    "Waiting for an opponent...";
});

socket.on("gameStart", (data) => {
  gameId = data.gameId;
  playerIndex = data.playerIndex;
  fetchCards(); // Fetch cards when the game starts
  document.getElementById("waiting-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  updateScores(0, 0); // Initialize scores
});

socket.on("newWord", (data) => {
  document.getElementById("definition").textContent = data.definition;
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  data.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("word-option", "col-12", "col-md-6", "col-lg-3");
    button.addEventListener("click", () => submitAnswer(option));
    optionsContainer.appendChild(button);
  });
  updateScores(data.score, data.opponentScore);
  startTimer();
});

socket.on("answerResult", (data) => {
  const resultElement = document.getElementById("result");
  resultElement.textContent = data.correct ? "Correct!" : "Incorrect";
  resultElement.style.color = data.correct ? "green" : "red";
  setTimeout(() => {
    resultElement.textContent = "";
  }, 1000);
});

function updateScores(playerScore, opponentScore) {
  const playerProgress = document.getElementById("player-progress");
  const opponentProgress = document.getElementById("opponent-progress");
  
  playerProgress.style.width = `${playerScore}%`;
  playerProgress.setAttribute("aria-valuenow", playerScore);
  
  opponentProgress.style.width = `${opponentScore}%`;
  opponentProgress.setAttribute("aria-valuenow", opponentScore);
  
  document.getElementById("score").textContent = `Your Score: ${playerScore}`;
}

socket.on("gameEnd", (data) => {
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  const message = data.aborted
    ? "Game aborted. Your opponent disconnected."
    : `Game Over! ${data.winner === playerIndex ? "You win!" : "You lose."}`;
  document.getElementById("end-message").textContent = message;
  document.getElementById(
    "final-score"
  ).textContent = `Your final score: ${data.finalScore}`;
});

function submitAnswer(answer) {
  socket.emit("answer", { gameId, answer, time: getElapsedTime() });
}

let timerInterval;
let startTime;

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
  const elapsedTime = getElapsedTime();
  document.getElementById("timer").textContent = `Time: ${elapsedTime.toFixed(
    1
  )}s`;
}

function getElapsedTime() {
  return (Date.now() - startTime) / 1000;
}

document.getElementById("play-again").addEventListener("click", () => {
  document.getElementById("end-screen").style.display = "none";
  document.getElementById("home-screen").style.display = "block";
});

document.getElementById("homeButton").addEventListener("click", function () {
  window.location.href = "index.html";
});
