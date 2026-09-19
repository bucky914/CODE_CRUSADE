const form = document.querySelector("#registration-form");
const message = document.querySelector("#form-message");
const startButton = document.querySelector("#start-button");

function showMessage(text) { message.textContent = text; }

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.querySelector("#name").value.trim();
  const passNo = document.querySelector("#pass-number").value.trim();
  showMessage("");
  if (!name) return showMessage("Please enter your name.");
  if (!passNo) return showMessage("Please enter your pass number.");
  if (!supabaseClient) return showMessage("The competition connection is not configured yet. Please contact the organizer.");

  startButton.disabled = true;
  startButton.querySelector("span").textContent = "STARTING…";
  try {
    const { data, error } = await supabaseClient
      .from("participants")
      // `started_at` is deliberately omitted: PostgreSQL's `default now()` is authoritative.
      .insert({ name, pass_no: passNo, status: "started" })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("This pass number has already started a competition attempt.");
      throw new Error("Unable to start the competition. Please try again.");
    }
    localStorage.setItem("participant_id", data.id);
    window.location.assign("exam.html");
  } catch (error) {
    showMessage(error.message || "Unable to start the competition. Please try again.");
    startButton.disabled = false;
    startButton.querySelector("span").textContent = "START NOW";
  }
});
