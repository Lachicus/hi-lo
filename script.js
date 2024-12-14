let runningCount = 0;
let cardsDealt = 0;
let decksRemaining = 8;
const CARDS_PER_DECK = 52;

const cardValues = {
    "2": 1, "3": 1, "4": 1, "5": 1, "6": 1,
    "7": 0, "8": 0, "9": 0,
    "10": -1, "J": -1, "Q": -1, "K": -1, "A": -1
};

let cardGroups = JSON.parse(localStorage.getItem("cardGroups")) || {
    "2": 1,
    "4": 0,
    "3": -1
};

let highCount = 0;
let neutralCount = 0;
let lowCount = 0;

document.getElementById("enter-btn").addEventListener("click", finalizeInput);
document.getElementById("end-btn").addEventListener("click", resetSession);
document.getElementById("settings-btn").addEventListener("click", showSettings);
document.getElementById("close-modal").addEventListener("click", hideSettings);
document.getElementById("save-settings").addEventListener("click", saveHotkeys);

document.getElementById("card-input").addEventListener("input", processCards);

document.getElementById("card-input").addEventListener("keypress", function (e) {
    const input2 = document.getElementById("card-input").value.toUpperCase().trim();
    if(input2 === "00"){
        resetSession();
    }
  
    if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submission on enter key
        finalizeInput(); // Trigger final input processing on enter
    }

});

// Process cards as the user types
function processCards() {
    const loadingLine = document.getElementById("loading-line");
    loadingLine.classList.remove("hidden");  // Show the loading line
    loadingLine.style.width = "100%"; // Simulate loading animation

    const input = document.getElementById("card-input").value.toUpperCase().trim();
    let newHighCount = 0;
    let newNeutralCount = 0;
    let newLowCount = 0;

    // Process each character in the input string
    for (const char of input) {
        if (cardGroups[char] !== undefined) {
            if (cardGroups[char] === -1) newHighCount++;
            if (cardGroups[char] === 0) newNeutralCount++;
            if (cardGroups[char] === 1) newLowCount++;
        } else if (cardValues[char] !== undefined) {
            if (cardValues[char] === -1) newHighCount++;
            if (cardValues[char] === 0) newNeutralCount++;
            if (cardValues[char] === 1) newLowCount++;
        }
    }

    // Update the frequency counts for visual feedback
    highCount = newHighCount;
    neutralCount = newNeutralCount;
    lowCount = newLowCount;

    // Update the frequency display
    updateFrequencyDisplay();

    // Hide the loading line after processing
    loadingLine.style.width = "0%";
}

// Finalize input when "Enter" is clicked
function finalizeInput() {
    const input = document.getElementById("card-input").value.toUpperCase().trim();
    
    // Update running counts based on current input
    runningCount += (lowCount - highCount); // Adjust running count
    cardsDealt += highCount + neutralCount + lowCount;

    decksRemaining = 8 - cardsDealt / CARDS_PER_DECK;
    const trueCount = runningCount / (decksRemaining || 1); // Avoid division by zero
    const estimatedEdge = trueCount * 0.5;

    updateUI(trueCount, estimatedEdge);
    
    // Provide a suggested decision based on the true count
    suggestDecision(trueCount);
    
    // Reset frequency counts for the next round
    resetCounts(); // Clear input but not running counts
}

// Reset counts when "Enter" is clicked
function resetCounts() {
    highCount = 0; 
    neutralCount = 0; 
    lowCount = 0; 
    updateFrequencyDisplay(); // Update frequency display
    document.getElementById("card-input").value = ''; // Clear input
}

// Reset the entire session
function resetSession() {
    runningCount = 0;
    cardsDealt = 0;
    decksRemaining = 8;
    resetCounts(); // Reset frequency counts
    updateUI(0, 0);
}

// Update the UI with the current values
function updateUI(trueCount, estimatedEdge) {
    document.getElementById("running-count").textContent = runningCount;
    document.getElementById("true-count").textContent = trueCount.toFixed(2);
    document.getElementById("estimated-edge").textContent = estimatedEdge.toFixed(2) + "%";
    document.getElementById("decks-remaining").textContent = decksRemaining.toFixed(2);
    document.getElementById("cards-dealt").textContent = cardsDealt.toFixed(2);
}

// Update the frequency display based on counts
function updateFrequencyDisplay() {
    const total = highCount + neutralCount + lowCount;
    document.getElementById("high-cards").style.width = `${(highCount / total) * 100 || 0}%`;
    document.getElementById("neutral-cards").style.width = `${(neutralCount / total) * 100 || 0}%`;
    document.getElementById("low-cards").style.width = `${(lowCount / total) * 100 || 0}%`;
}

// Suggest a decision based on the true count
function suggestDecision(trueCount) {
    let suggestion = "";
    if (trueCount >= 5) {
        suggestion = "Bet 4 Lots";
    } else if (trueCount >= 4.60) {
        suggestion = "Bet 4 Lots";
    } else if (trueCount >= 4) {
        suggestion = "Bet 4 Lots";
    } else if (trueCount >= 3) {
        suggestion = "Bet 3 Lots";
    } else if (trueCount >= 2.60) {
        suggestion = "Bet 3 Lots";
    } else if (trueCount >= 1.57) {
        suggestion = "Bet 2 Lots";
    } else if (trueCount >= 0.60) {
        if (Math.abs(runningCount - decksRemaining) < 1.5  || runningCount > decksRemaining) {
            suggestion = "Bet 1 Lot";
        }
    } else {
        suggestion = "No recommended bets.";
    }
    document.getElementById("suggested-action").textContent = suggestion; // Display suggestion in the existing span
}

function showSettings() {
    document.getElementById("settings-modal").classList.remove("hidden");
}

function hideSettings() {
    document.getElementById("settings-modal").classList.add("hidden");
}

function saveHotkeys() {
    const lowHotkey = document.getElementById("low-hotkey").value;
    const neutralHotkey = document.getElementById("neutral-hotkey").value;
    const highHotkey = document.getElementById("high-hotkey").value;

    if (lowHotkey) cardGroups[lowHotkey] = 1;
    if (neutralHotkey) cardGroups[neutralHotkey] = 0;
    if (highHotkey) cardGroups[highHotkey] = -1;

    localStorage.setItem("cardGroups", JSON.stringify(cardGroups));
    hideSettings();
}
