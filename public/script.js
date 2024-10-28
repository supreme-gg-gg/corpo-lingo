let selectedWord = null;
let selectedDefinition = null;
let matchedPairs = 0;
let totalPairs = 0;
let cards = [];

// Function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to create a card element
function createCard(content, type, id) {
  const card = document.createElement("div");
  card.className = "card";
  card.textContent = content;
  card.dataset.type = type;
  card.dataset.id = id;
  card.addEventListener("click", handleCardClick);
  return card;
}

function populateBoard() {
  const wordsRow = document.getElementById("wordsRow");
  const definitionsRow = document.getElementById("definitionsRow");

  wordsRow.innerHTML = "";
  definitionsRow.innerHTML = "";

  const shuffledWords = shuffle([...cards]);
  const shuffledDefinitions = shuffle([...cards]);

  shuffledWords.forEach((card) => {
    wordsRow.appendChild(createCard(card.word, "word", card.id));
  });

  shuffledDefinitions.forEach((card) => {
    definitionsRow.appendChild(
      createCard(card.definition, "definition", card.id)
    );
  });
}

// Function to handle card clicks
function handleCardClick(event) {
  const clickedCard = event.target;

  if (clickedCard.classList.contains("matched")) {
    return; // Ignore clicks on already matched cards
  }

  if (clickedCard.dataset.type === "word") {
    if (selectedWord) {
      selectedWord.classList.remove("selected");
    }
    selectedWord = clickedCard;
  } else {
    if (selectedDefinition) {
      selectedDefinition.classList.remove("selected");
    }
    selectedDefinition = clickedCard;
  }

  clickedCard.classList.add("selected");

  checkForMatch();
}

// Function to check if selected cards match
function checkForMatch() {
  if (selectedWord && selectedDefinition) {
    // Temporarily disable all cards
    document.querySelectorAll(".card").forEach(card => card.style.pointerEvents = "none");
    
    if (selectedWord.dataset.id === selectedDefinition.dataset.id) {
      // Match found
      selectedWord.classList.remove("selected");
      selectedDefinition.classList.remove("selected");
      selectedWord.classList.add("matched");
      selectedDefinition.classList.add("matched");
      matchedPairs++;
      updateProgressBar();
    } else {
      // No match
      selectedWord.classList.add("wrong");
      selectedDefinition.classList.add("wrong");
    }
    setTimeout(() => {
      selectedWord.classList.remove("selected", "wrong");
      selectedDefinition.classList.remove("selected", "wrong");
      selectedWord = null;
      selectedDefinition = null;
      
      // Reactivate cards
      document.querySelectorAll(".card").forEach(card => card.style.pointerEvents = "auto");
      if (selectedWord.dataset.id === selectedDefinition.dataset.id) {
        selectedWord.style.pointerEvents = "none";
        selectedDefinition.style.pointerEvents = "none";
      }
    }, 1000);
  }
}

// Function to update the progress bar
function updateProgressBar() {
  const progressBar = document.getElementById("progress");
  const progressPercentage = (matchedPairs / totalPairs) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  if (matchedPairs === totalPairs) {
    setTimeout(() => {
      endGame();
    }, 500);
  }
}

function endGame() {
  document.getElementById("game-area").style.display = "none";
  document.getElementById("endgame-area").style.display = "block";
  document.getElementById("endgame-area").innerHTML = `
    <h2>Congratulations!</h2>
    <p class="text-center">You've matched all the cards!</p>
    <p class="text-center">Click Reset Cards to play again, or try a new game mode.</p>
  `;
  startConfetti();
}

// Function to reset the game
function resetGame() {
  stopConfetti();
  document.getElementById("endgame-area").innerHTML = "";
  document.getElementById("endgame-area").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  selectedWord = null;
  selectedDefinition = null;
  matchedPairs = 0;
  updateProgressBar();
  fetchCards();
}

// Function to fetch cards from the backend
function fetchCards() {
  fetch("/cards")
    .then((response) => response.json())
    .then((data) => {
      cards = data;
      totalPairs = cards.length;
      populateBoard();
      updateProgressBar();
    })
    .catch((error) => {
      console.error("Error fetching cards:", error);
    });
}

// Event listener for the reset button
document.getElementById("resetButton").addEventListener("click", resetGame);

// Initialize the game
fetchCards();
