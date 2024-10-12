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
    if (selectedWord.dataset.id === selectedDefinition.dataset.id) {
      // Match found
      selectedWord.classList.remove("selected");
      selectedDefinition.classList.remove("selected");
      selectedWord.classList.add("matched");
      selectedDefinition.classList.add("matched");
      selectedWord = null;
      selectedDefinition = null;
      matchedPairs++;
      updateProgressBar();
    } else {
      // No match
      selectedWord.classList.add("wrong");
      selectedDefinition.classList.add("wrong");
      setTimeout(() => {
        selectedWord.classList.remove("selected", "wrong");
        selectedDefinition.classList.remove("selected", "wrong");
        selectedWord = null;
        selectedDefinition = null;
      }, 1000);
    }
  }
}

// Function to update the progress bar
function updateProgressBar() {
  const progressBar = document.getElementById("progress");
  const progressPercentage = (matchedPairs / totalPairs) * 100;
  progressBar.style.width = `${progressPercentage}%`;

  if (matchedPairs === totalPairs) {
    setTimeout(() => {
      alert("Congratulations! You've matched all the cards!");
    }, 300);
  }
}

// Function to reset the game
function resetGame() {
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
