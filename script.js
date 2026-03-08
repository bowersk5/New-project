const form = document.getElementById("rating-form");
const messageEl = document.getElementById("message");
const ratingEl = document.getElementById("rating");
const tierEl = document.getElementById("tier");
const meterEl = document.getElementById("rating-meter");
const exampleBtn = document.getElementById("example-btn");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const fieldIds = ["attempts", "completions", "yards", "touchdowns", "interceptions"];

function calculatePasserRating({ attempts, completions, yards, touchdowns, interceptions }) {
  const a = clamp((completions / attempts - 0.3) * 5, 0, 2.375);
  const b = clamp((yards / attempts - 3) * 0.25, 0, 2.375);
  const c = clamp((touchdowns / attempts) * 20, 0, 2.375);
  const d = clamp(2.375 - (interceptions / attempts) * 25, 0, 2.375);
  return ((a + b + c + d) / 6) * 100;
}

function getValues() {
  const data = new FormData(form);
  return {
    attempts: Number(data.get("attempts")),
    completions: Number(data.get("completions")),
    yards: Number(data.get("yards")),
    touchdowns: Number(data.get("touchdowns")),
    interceptions: Number(data.get("interceptions")),
  };
}

function hasAllInputs() {
  return fieldIds.every((id) => document.getElementById(id).value.trim() !== "");
}

function clearInputStates() {
  fieldIds.forEach((id) => document.getElementById(id).classList.remove("invalid"));
}

function flagInvalid(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add("invalid");
  }
}

function getTier(rating) {
  if (rating >= 110) return "Elite";
  if (rating >= 95) return "Excellent";
  if (rating >= 85) return "Good";
  if (rating >= 70) return "Average";
  return "Needs Improvement";
}

function resetResult(message = "Enter stats and press Calculate Rating.") {
  messageEl.textContent = message;
  ratingEl.textContent = "--";
  tierEl.textContent = "Tier: --";
  meterEl.value = 0;
}

function validate(values) {
  clearInputStates();

  if (!Number.isFinite(values.attempts) || values.attempts <= 0) {
    flagInvalid("attempts");
    return "Attempts must be greater than 0.";
  }

  for (const key of ["completions", "yards", "touchdowns", "interceptions"]) {
    if (!Number.isFinite(values[key]) || values[key] < 0) {
      flagInvalid(key);
      return "Completions, yards, touchdowns, and interceptions must be 0 or more.";
    }
  }

  if (values.completions > values.attempts) {
    flagInvalid("completions");
    return "Completions cannot exceed attempts.";
  }

  return null;
}

function renderRating(values) {
  const rating = calculatePasserRating({
    attempts: values.attempts,
    completions: values.completions,
    yards: values.yards,
    touchdowns: values.touchdowns,
    interceptions: values.interceptions,
  });

  const bounded = clamp(rating, 0, 158.3);
  messageEl.textContent = "Official NFL passer rating:";
  ratingEl.textContent = bounded.toFixed(1);
  tierEl.textContent = `Tier: ${getTier(bounded)}`;
  meterEl.value = bounded;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = getValues();
  const error = validate(values);
  if (error) {
    resetResult(error);
    return;
  }
  renderRating(values);
});

form.addEventListener("reset", () => {
  clearInputStates();
  setTimeout(() => resetResult(), 0);
});

form.addEventListener("input", () => {
  if (!hasAllInputs()) {
    clearInputStates();
    resetResult();
    return;
  }

  const values = getValues();
  const error = validate(values);
  if (error) {
    resetResult(error);
    return;
  }
  renderRating(values);
});

exampleBtn.addEventListener("click", () => {
  document.getElementById("attempts").value = "35";
  document.getElementById("completions").value = "24";
  document.getElementById("yards").value = "280";
  document.getElementById("touchdowns").value = "2";
  document.getElementById("interceptions").value = "1";
  renderRating(getValues());
});
