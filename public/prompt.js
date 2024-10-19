let cards = []; // Array to hold the cards for matching
let matchedPairs = 0;
let totalPairs = 0;
let selectedWord = null;
let selectedDefinition = null;
let selectedIndustry = null;

document.getElementById("start-prompt-button").addEventListener("click", () => {
  if (selectedIndustry != null) {
    document.getElementById("selection-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    const alertMsg = "You have selected "+selectedIndustry;
    alert(alertMsg);
  }
});

function updateIndustry(industryString) {
  const industries = Array.from(document.querySelectorAll('.industry-option'));
  industries.forEach((industry) => {
    industry.classList.remove("matched");
  });
  const chosenIndustry = document.getElementById(industryString);
  chosenIndustry.classList.remove("option-default");
  chosenIndustry.classList.add("matched");
  selectedIndustry = chosenIndustry.textContent;
}

document.getElementById("finance-ind-button").addEventListener("click", () => {
  updateIndustry("finance-ind-button");
});
document.getElementById("education-ind-button").addEventListener("click", () => {
  updateIndustry("education-ind-button");
});
document.getElementById("marketing-ind-button").addEventListener("click", () => {
  updateIndustry("marketing-ind-button");
});
document.getElementById("tech-ind-button").addEventListener("click", () => {
  updateIndustry("tech-ind-button");
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


socket.on("newWord", (data) => {
  document.getElementById("definition").textContent = data.definition;
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  data.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("word-option", "default", "col-12", "col-md-6", "col-lg-3");
    button.addEventListener("click", () => submitAnswer(option));
    optionsContainer.appendChild(button);
  });
  updateScores(data.score, data.opponentScore);
  startTimer();
});

socket.on("answerResult", (data) => {
  
  // Disable all word options temporarily
  // document.querySelectorAll('.word-option').forEach(option => option.style.pointerEvents = 'none');

  document.querySelectorAll('.word-option').forEach(option => {
    option.classList.add("disabled");
  });

  const definitionBox = document.querySelector('.definition-box')
  const correctWordOption = Array.from(document.querySelectorAll('.word-option')).find(option => option.textContent === data.correctWord);
  const selectedWordOption = Array.from(document.querySelectorAll('.word-option')).find(option => option.textContent === data.selectedWord);

  definitionBox.classList.remove("option-default");
  selectedWordOption.classList.remove("option-default");
  
  if (data.correct) {
    definitionBox.classList.add("matched");
    selectedWordOption.classList.add("matched");
  } else {
    definitionBox.classList.add("wrong");
    selectedWordOption.classList.add("wrong");
  }

  // Wait for a moment before moving to the next question
  setTimeout(() => {
    definitionBox.classList.remove("matched", "wrong");
    document.querySelectorAll('.word-option').forEach(option => {
      option.classList.remove("selected", "matched", "wrong", "disabled");
      option.classList.add("default");
      option.style.pointerEvents = 'auto';
    });
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
  selectedWord = answer;
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

/*
document.getElementById("homeButton").addEventListener("click", function () {
  window.location.href = "index.html";
});
*/