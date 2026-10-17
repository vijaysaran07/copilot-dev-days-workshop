// Tests use Node's built-in test runner, so nothing needs to be installed.
// Run them with:  npm test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  shuffle,
  isCorrect,
  createQuiz,
  answerQuestion,
  isQuizFinished,
  calculatePercentage,
  isNewBestScore,
  getGrade,
  getFeedbackMessage,
  formatTimeLeft,
} = require("../src/quiz.js");

test("isCorrect returns true for the right answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 2), true);
});

test("isCorrect returns false for a wrong answer", () => {
  assert.equal(isCorrect({ answer: 2 }, 0), false);
});

test("createQuiz initializes an independent state from questions", () => {
  const questions = [{ question: "Q", options: ["A"], answer: 0 }];
  const state = createQuiz(questions);

  assert.deepEqual(state, { questions, current: 0, score: 0 });
  assert.notEqual(state, questions);
  assert.notEqual(state.questions, questions);
});

test("createQuiz initializes an empty quiz", () => {
  assert.deepEqual(createQuiz([]), { questions: [], current: 0, score: 0 });
});

test("createQuiz rejects null questions", () => {
  assert.throws(() => createQuiz(null), TypeError);
});

test("answerQuestion advances and scores a correct answer without mutation", () => {
  const original = createQuiz([{ answer: 1 }]);
  const result = answerQuestion(original, 1);

  assert.equal(result.correct, true);
  assert.deepEqual(result.state, {
    questions: original.questions,
    current: 1,
    score: 1,
  });
  assert.deepEqual(original, {
    questions: [{ answer: 1 }],
    current: 0,
    score: 0,
  });
});

test("answerQuestion advances without scoring a wrong answer", () => {
  const result = answerQuestion(createQuiz([{ answer: 1 }]), 0);

  assert.equal(result.correct, false);
  assert.equal(result.state.current, 1);
  assert.equal(result.state.score, 0);
});

test("answerQuestion advances without scoring when no answer is selected", () => {
  const result = answerQuestion(createQuiz([{ answer: 0 }]), null);

  assert.equal(result.correct, false);
  assert.equal(result.state.current, 1);
  assert.equal(result.state.score, 0);
});

test("answerQuestion rejects null state", () => {
  assert.throws(() => answerQuestion(null, 0), TypeError);
});

test("answerQuestion rejects a finished quiz", () => {
  assert.throws(() => answerQuestion(createQuiz([]), 0), RangeError);
});

test("isQuizFinished returns true for an empty quiz", () => {
  assert.equal(isQuizFinished(createQuiz([])), true);
});

test("isQuizFinished returns false before the last question is answered", () => {
  assert.equal(isQuizFinished(createQuiz([{ answer: 0 }])), false);
});

test("isQuizFinished returns true after the last question is answered", () => {
  const answered = answerQuestion(createQuiz([{ answer: 0 }]), 0).state;

  assert.equal(isQuizFinished(answered), true);
});

test("isQuizFinished rejects null state", () => {
  assert.throws(() => isQuizFinished(null), TypeError);
});

test("calculatePercentage rounds to a whole number", () => {
  assert.equal(calculatePercentage(2, 3), 67);
});

test("calculatePercentage returns 0 when there are no questions", () => {
  assert.equal(calculatePercentage(0, 0), 0);
});

test("isNewBestScore returns true when there is no saved best", () => {
  assert.equal(isNewBestScore(0, null), true);
});

test("isNewBestScore returns true when the current score exceeds the best", () => {
  assert.equal(isNewBestScore(81, 80), true);
});

test("isNewBestScore returns false when the current score equals the best", () => {
  assert.equal(isNewBestScore(80, 80), false);
});

test("isNewBestScore returns false when the current score is below the best", () => {
  assert.equal(isNewBestScore(79, 80), false);
});

test("shuffle keeps every item and does not change the original array", () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(original, [1, 2, 3, 4, 5]);
});

test("getGrade returns A at 90%", () => {
  assert.equal(getGrade(90), "A");
});

test("getGrade returns B below 90%", () => {
  assert.equal(getGrade(89), "B");
});

test("getGrade returns B at 75%", () => {
  assert.equal(getGrade(75), "B");
});

test("getGrade returns C below 75%", () => {
  assert.equal(getGrade(74), "C");
});

test("getGrade returns C at 50%", () => {
  assert.equal(getGrade(50), "C");
});

test("getGrade returns the practice message below 50%", () => {
  assert.equal(getGrade(49), "Keep practicing");
});

test("getFeedbackMessage returns an excellent message for grade A", () => {
  assert.equal(getFeedbackMessage("A"), "Excellent work!");
});

test("getFeedbackMessage returns an encouraging message for grade B", () => {
  assert.equal(getFeedbackMessage("B"), "Great job!");
});

test("getFeedbackMessage returns an encouraging message for grade C", () => {
  assert.equal(getFeedbackMessage("C"), "Good effort!");
});

test("getFeedbackMessage encourages practice for other grades", () => {
  assert.equal(getFeedbackMessage("Keep practicing"), "Keep practicing!");
});

test("formatTimeLeft formats remaining seconds", () => {
  assert.equal(formatTimeLeft(15), "⏱ 15s");
  assert.equal(formatTimeLeft(12), "⏱ 12s");
  assert.equal(formatTimeLeft(5), "⏱ 5s");
});

test("formatTimeLeft formats zero seconds", () => {
  assert.equal(formatTimeLeft(0), "⏱ 0s");
});
