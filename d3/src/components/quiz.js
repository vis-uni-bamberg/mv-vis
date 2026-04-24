/**
 * createQuiz({ question, answers, incorrectFeedback, correctFeedback }) → HTMLElement
 *
 * answers: Array<{ text: string, correct?: boolean }>
 */
export function createQuiz({
  question,
  answers,
  incorrectFeedback = "Incorrect — try again.",
  correctFeedback = "Correct!",
}) {
  const container = document.createElement("div");
  container.className = "quiz-container";

  const qEl = document.createElement("p");
  qEl.className = "quiz-question";
  qEl.innerHTML = `<strong>Quiz:</strong> ${question}`;
  container.appendChild(qEl);

  const form = document.createElement("form");
  const groupName = "quiz-" + Math.random().toString(36).slice(2);

  answers.forEach((ans, i) => {
    const label = document.createElement("label");
    label.className = "quiz-option";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = groupName;
    radio.value = String(i);
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + ans.text));
    form.appendChild(label);
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "quiz-btn";
  btn.textContent = "Check Answer";

  const feedback = document.createElement("p");
  feedback.className = "quiz-feedback";

  btn.addEventListener("click", () => {
    const selected = form.querySelector("input:checked");
    if (!selected) {
      feedback.textContent = "Please select an answer first.";
      feedback.style.color = "#888";
      return;
    }
    const idx = parseInt(selected.value, 10);
    const isCorrect = answers[idx].correct === true;
    feedback.textContent = isCorrect ? correctFeedback : incorrectFeedback;
    feedback.style.color = isCorrect ? "#2e7d32" : "#c0392b";
    if (isCorrect) {
      form.querySelectorAll("label").forEach((lbl, i) => {
        if (answers[i].correct) {
          lbl.style.fontWeight = "bold";
          lbl.style.color = "#2e7d32";
        }
      });
      btn.disabled = true;
    }
  });

  form.appendChild(btn);
  container.appendChild(form);
  container.appendChild(feedback);
  return container;
}
