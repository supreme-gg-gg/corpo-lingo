let correctWord = null;
let score = 0;
let selectedIndustry = null;
let promptCompleted = false;

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}


document.getElementById("start-prompt-button").addEventListener("click", () => {
  if (selectedIndustry != null) {
    document.getElementById("selection-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    fetch("/store-selection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ selections: selectedIndustry })
    })

    getPrompt();
  };
});

// creates scenario, correctAnswer, incorrectChoices that are used to populate the screen
function getPrompt() {
  fetch("/get-prompt")
    .then(response => response.json())
    .then(data => {
      const { scenario, correctAnswer, incorrectChoices } = data;
      populateBoard(data);
      //console.log(scenario, correctAnswer, incorrectChoices);
    })
    .catch(error => {
      console.error("Error fetching selection data:", error);
    });
}

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

function populateBoard(data) {
  promptCompleted = false;
  document.getElementById("nextButton").classList.add("disabled");
  const { scenario, correctAnswer, incorrectChoices } = data;
  const options = incorrectChoices;
  options.push(correctAnswer);
  shuffle(options);
  document.getElementById("scenario").textContent = scenario;
  correctWord = correctAnswer;
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("word-option", "default", "col-12", "col-md-6", "col-lg-3");
    button.addEventListener("click", () => submitAnswer(option));
    optionsContainer.appendChild(button);
  });
  document.getElementById("score").textContent = "Score: "+score;
}

function submitAnswer(selectedOption) {
  if (!promptCompleted) {
    // Disable all word options temporarily
    // document.querySelectorAll('.word-option').forEach(option => option.style.pointerEvents = 'none');

    document.querySelectorAll('.word-option').forEach(option => {
      option.classList.add("disabled");
    });

    const definitionBox = document.querySelector('.definition-box')
    const selectedWordOption = Array.from(document.querySelectorAll('.word-option')).find(option => option.textContent === selectedOption);

    definitionBox.classList.remove("option-default");
    selectedWordOption.classList.remove("option-default");
    
    const correct = selectedOption === correctWord;
    if (correct) {
      definitionBox.classList.add("matched");
      selectedWordOption.classList.add("matched");
      promptCompleted = true;
      document.getElementById("nextButton").classList.remove("disabled");
      score++;
      document.getElementById("score").textContent = "Score: "+score;
    } else {
      definitionBox.classList.add("wrong");
      selectedWordOption.classList.add("wrong");
    }

    // Wait for a moment for animation
    setTimeout(() => {
      definitionBox.classList.remove("matched", "wrong");
      document.querySelectorAll('.word-option').forEach(option => {
        option.classList.remove("selected", "matched", "wrong", "disabled");
        option.classList.add("default");
        option.style.pointerEvents = 'auto';
      });
    }, 1000);
  }
}

document.getElementById("nextButton").addEventListener("click", () => {
  if (promptCompleted) {
    getPrompt();
  }
});

document.getElementById("homeButton").addEventListener("click", () => {
  window.location.href = "index.html";
});