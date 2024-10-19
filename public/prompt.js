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
    fetch("http://localhost:8080/store-selection", {
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
  fetch("http://localhost:8080/get-prompt")
    .then(response => response.json())
    .then(data => {
      const { scenario, correctAnswer, incorrectChoices } = data;
      console.log(scenario, correctAnswer, incorrectChoices);
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

document.getElementById("homeButton").addEventListener("click", () => {
  window.location.href = "index.html";
});