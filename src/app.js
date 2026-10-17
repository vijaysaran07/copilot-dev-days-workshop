// UI code: connects the quiz logic (quiz.js) to the page (index.html).

const QUESTION_TIME_LIMIT = 15;
const BEST_SCORE_STORAGE_KEY = "dev-days-quiz-best-score";
let state = createQuiz([]);
let timeLeft = QUESTION_TIME_LIMIT;
let timerInterval = null;
let bestScore = null;
let storageUnavailable = false;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options");
const feedbackText = document.getElementById("feedback");
const nextButton = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const gradeText = document.getElementById("grade-text");
const startBestScoreText = document.getElementById("start-best-score");
const startBestScoreStatus = document.getElementById("start-best-score-status");
const resultBestScoreText = document.getElementById("result-best-score");
const newBestCelebration = document.getElementById("new-best-celebration");
const resultBestScoreStatus = document.getElementById("result-best-score-status");

function loadBestScore() {
  try {
    const savedScore = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    const parsedScore = savedScore === null ? null : Number(savedScore);
    bestScore =
      Number.isInteger(parsedScore) && parsedScore >= 0 && parsedScore <= 100
        ? parsedScore
        : null;
    storageUnavailable = false;
  } catch {
    bestScore = null;
    storageUnavailable = true;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
    bestScore = score;
    storageUnavailable = false;
    return true;
  } catch {
    storageUnavailable = true;
    return false;
  }
}

function formatBestScore() {
  if (bestScore !== null) return `Best score: ${bestScore}%`;
  return storageUnavailable ? "Best score: unavailable." : "Best score: No score yet.";
}

function formatStorageStatus() {
  return storageUnavailable
    ? "Best score storage is unavailable; your score may not persist after you leave this page."
    : "";
}

function updateStartBestScore() {
  startBestScoreText.textContent = formatBestScore();
  startBestScoreStatus.textContent = formatStorageStatus();
}

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function startQuiz() {
  stopTimer();
  state = createQuiz(shuffle(QUESTIONS));
  showScreen(quizScreen);
  renderQuestion();
}

function renderQuestion() {
  stopTimer();
  const question = state.questions[state.current];
  progressText.textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  questionText.textContent = question.question;
  feedbackText.textContent = "";
  nextButton.hidden = true;
  optionsList.innerHTML = "";

  question.options.forEach((option, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => selectAnswer(index, button));
    item.appendChild(button);
    optionsList.appendChild(item);
  });

  startTimer();
}

function updateTimer() {
  timerText.textContent = formatTimeLeft(timeLeft);
  timerText.classList.toggle("urgent", timeLeft <= 5);
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer() {
  stopTimer();
  timeLeft = QUESTION_TIME_LIMIT;
  updateTimer();

  const intervalId = setInterval(() => {
    if (timerInterval !== intervalId) return;

    timeLeft--;
    updateTimer();
    if (timeLeft === 0) {
      const question = state.questions[state.current];
      const buttons = optionsList.querySelectorAll("button");
      selectAnswer(question.answer, buttons[question.answer], true);
    }
  }, 1000);
  timerInterval = intervalId;
}

function selectAnswer(selectedIndex, selectedButton, timedOut = false) {
  stopTimer();
  const question = state.questions[state.current];
  const buttons = optionsList.querySelectorAll("button");
  buttons.forEach((button) => (button.disabled = true));
  const result = answerQuestion(state, timedOut ? null : selectedIndex);
  state = result.state;

  if (timedOut) {
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Time's up!";
  } else if (result.correct) {
    selectedButton.classList.add("correct");
    feedbackText.textContent = "Correct!";
  } else {
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    feedbackText.textContent = "Not quite. The correct answer is highlighted.";
  }

  nextButton.hidden = false;
  nextButton.focus();
}

function nextQuestion() {
  if (isQuizFinished(state)) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  const total = state.questions.length;
  const percentage = calculatePercentage(state.score, total);
  const newBest = isNewBestScore(percentage, bestScore);

  if (newBest && !saveBestScore(percentage)) {
    bestScore = percentage;
  }

  scoreText.textContent = `You scored ${state.score} out of ${total} (${percentage}%)`;
  gradeText.textContent = `Grade: ${getGrade(percentage)}`;
  resultBestScoreText.textContent = formatBestScore();
  newBestCelebration.textContent = newBest
    ? `New personal best: ${percentage}%!`
    : "";
  resultBestScoreStatus.textContent = formatStorageStatus();
  showScreen(resultScreen);
}

loadBestScore();
updateStartBestScore();

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
