document.addEventListener("DOMContentLoaded", function () {
    const startGameBtn = document.getElementById("startGame");
    const showMistakesBtn = document.getElementById("showMistakesInGame");
    const coverPage = document.getElementById("coverPage");
    const gamePage = document.getElementById("gamePage");
    const historyPage = document.getElementById("historyPage");
    const questionText = document.getElementById("question");
    const answerInput = document.getElementById("answerInput");
    const submitButton = document.getElementById("submit");
    const clearButton = document.getElementById("clear");
    const numPadButtons = document.querySelectorAll(".num-btn");
    const timerText = document.getElementById("timer");
    const scoreText = document.getElementById("score");
    const correctAttemptedText = document.getElementById("correctAttempted");
    const restartButton = document.getElementById("restartButton");
    const exitButton = document.getElementById("exitButton");
    const closeHistoryButton = document.getElementById("closeHistory");
    const usernameInput = document.getElementById("username");
    const operationRadios = document.querySelectorAll('input[name="operation"]');
    const historyList = document.getElementById("historyList");
    const resetHighScoreBtn = document.getElementById("resetHighScore");
    const highScoreList = document.getElementById("highScoreList");

    let score = 0;
    let correct = 0;
    let attempted = 0;
    let timer = 60;
    let currentQuestion;
    let timerInterval;
    let gameActive = false;
    let history = []; // Stores mistakes for the current game
    let selectedOperation = "+"; // Default operation

    function startGame() {
        clearInterval(timerInterval); // Clear any existing timer
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Please enter your name to start!");
            return;
        }

        // Reset history for the new game
        history = [];

        // Get the selected operation
        selectedOperation = Array.from(operationRadios).find((radio) => radio.checked).value;

        score = 0;
        correct = 0;
        attempted = 0;
        timer = 60;
        scoreText.textContent = score;
        correctAttemptedText.textContent = `${correct} / ${attempted}`;
        timerText.textContent = timer;
        coverPage.style.display = "none";
        gamePage.style.display = "block";
        historyPage.style.display = "none";
        showMistakesBtn.style.display = "none";
        answerInput.focus();
        gameActive = true;
        generateQuestion();
        startTimer();
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timer--;
            timerText.textContent = timer;
            if (timer <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = "0"; // Ensure "Time Left" shows 0
                endGame();
            }
        }, 1000);
    }

    function generateQuestion() {
        if (!gameActive) return;

        let num1, num2, answer;

        do {
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;

            switch (selectedOperation) {
                case "+":
                    answer = num1 + num2;
                    break;
                case "-":
                    if (num1 < num2) [num1, num2] = [num2, num1];
                    answer = num1 - num2;
                    break;
                case "×":
                    num1 = Math.floor(Math.random() * 11); // 0 to 10
                    num2 = Math.floor(Math.random() * 11); // 0 to 10
                    answer = num1 * num2;
                    break;
                case "÷":
                    num2 = Math.floor(Math.random() * 10) + 1;
                    num1 = num2 * (Math.floor(Math.random() * 10) + 1);
                    answer = num1 / num2;
                    break;
            }
        } while (!Number.isInteger(answer));

        currentQuestion = answer;
        questionText.textContent = `${num1} ${selectedOperation} ${num2} = ?`;
    }

    function checkAnswer() {
        if (!gameActive || answerInput.value.trim() === "") return;

        attempted++;
        const userAnswer = parseInt(answerInput.value, 10);
        if (isNaN(userAnswer)) {
            alert("Please enter a valid number!");
            return;
        }

        if (userAnswer === currentQuestion) {
            score += 1;
            correct++;
        } else {
            history.push({ question: questionText.textContent, answer: userAnswer, correctAnswer: currentQuestion });
        }

        scoreText.textContent = score;
        correctAttemptedText.textContent = `${correct} / ${attempted}`;
        answerInput.value = "";
        answerInput.focus();
        generateQuestion();
    }

    function endGame() {
        gameActive = false;
        alert(`Time's up! Your score: ${score}\nCorrect / Attempted: ${correct} / ${attempted}`);
        saveHighScore();
        showMistakesBtn.style.display = "block";
    }

    function showHistory() {
        historyPage.style.display = "block";
        historyList.innerHTML = history
            .map((item) => {
                return `<p>${item.question} Your answer: ${item.answer} (Correct answer: ${item.correctAnswer})</p>`;
            })
            .join("");
    }

    function saveHighScore() {
        try {
            const username = usernameInput.value.trim();
            const highScores = JSON.parse(localStorage.getItem("highScores")) || {};
            const operationName = getOperationName(selectedOperation);

            if (!highScores[operationName]) highScores[operationName] = [];
            highScores[operationName].push({ username, score });
            highScores[operationName].sort((a, b) => b.score - a.score); // Sort by score in descending order
            highScores[operationName] = highScores[operationName].slice(0, 5); // Keep only top 5

            localStorage.setItem("highScores", JSON.stringify(highScores));
            updateHighScoreList();
        } catch (error) {
            console.error("Failed to save high score:", error);
        }
    }

    function getOperationName(operation) {
        switch (operation) {
            case "+": return "+ Addition";
            case "-": return "- Subtraction";
            case "×": return "× Multiplication";
            case "÷": return "÷ Division";
            default: return operation;
        }
    }

    function updateHighScoreList() {
        const highScores = JSON.parse(localStorage.getItem("highScores")) || {};
        highScoreList.innerHTML = Object.keys(highScores)
            .map((operation) => {
                return `
                    <div>
                        <h3>${operation}</h3>
                        <ul>
                            ${highScores[operation].map((entry) => `<li>${entry.username}: ${entry.score}</li>`).join("")}
                        </ul>
                    </div>
                `;
            })
            .join("");
    }

    function resetHighScore() {
        localStorage.removeItem("highScores");
        updateHighScoreList();
    }

    // Event Listeners
    startGameBtn.addEventListener("click", startGame);
    submitButton.addEventListener("click", checkAnswer);
    restartButton.addEventListener("click", startGame);
    exitButton.addEventListener("click", () => {
        clearInterval(timerInterval);
        gamePage.style.display = "none";
        coverPage.style.display = "block";
        historyPage.style.display = "none";
    });
    closeHistoryButton.addEventListener("click", () => {
        historyPage.style.display = "none";
    });
    showMistakesBtn.addEventListener("click", showHistory);
    resetHighScoreBtn.addEventListener("click", resetHighScore);

    clearButton.addEventListener("click", () => answerInput.value = "");
    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") checkAnswer();
    });

    numPadButtons.forEach(button => {
        button.addEventListener("click", () => {
            answerInput.value += button.textContent;
        });
    });

    // Load High Scores
    updateHighScoreList();
});