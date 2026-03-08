const form = document.getElementById("rating-form");
const messageEl = document.getElementById("message");
const ratingEl = document.getElementById("rating");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function calculatePasserRating({ attempts, completions, yards, touchdowns, interceptions }) {
  const a = clamp((completions / attempts - 0.3) * 5, 0, 2.375);
  const b = clamp((yards / attempts - 3) * 0.25, 0, 2.375);
  const c = clamp((touchdowns / attempts) * 20, 0, 2.375);
  const d = clamp(2.375 - (interceptions / attempts) * 25, 0, 2.375);
  return ((a + b + c + d) / 6) * 100;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const attempts = Number(data.get("attempts"));
  const completions = Number(data.get("completions"));
  const yards = Number(data.get("yards"));
  const touchdowns = Number(data.get("touchdowns"));
  const interceptions = Number(data.get("interceptions"));

  if (!Number.isFinite(attempts) || attempts <= 0) {
    messageEl.textContent = "Attempts must be greater than 0.";
    ratingEl.textContent = "--";
    return;
  }

  if ([completions, yards, touchdowns, interceptions].some((v) => !Number.isFinite(v) || v < 0)) {
    messageEl.textContent = "Completions, yards, touchdowns, and interceptions must be 0 or more.";
    ratingEl.textContent = "--";
    return;
  }

  if (completions > attempts) {
    messageEl.textContent = "Completions cannot exceed attempts.";
    ratingEl.textContent = "--";
    return;
  }

  const rating = calculatePasserRating({
    attempts,
    completions,
    yards,
    touchdowns,
    interceptions,
  });

  const bounded = clamp(rating, 0, 158.3);
  messageEl.textContent = "Official NFL passer rating:";
  ratingEl.textContent = bounded.toFixed(1);
});
