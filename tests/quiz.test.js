// Tests use Node's built-in test runner, so nothing needs to be installed.
// Run them with:  npm test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  shuffle,
  isCorrect,
  calculatePercentage,
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

test("calculatePercentage rounds to a whole number", () => {
  assert.equal(calculatePercentage(2, 3), 67);
});

test("calculatePercentage returns 0 when there are no questions", () => {
  assert.equal(calculatePercentage(0, 0), 0);
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
