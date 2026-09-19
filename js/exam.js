const DURATION_MS = 90 * 60 * 1000;
const participantId = localStorage.getItem("participant_id");
const countdown = document.querySelector("#countdown");
const timerPanel = document.querySelector("#timer-panel");
const overlay = document.querySelector("#expired-overlay");
const dashboardMessage = document.querySelector("#dashboard-message");
let timerId;

function redirectToRegistration() { window.location.replace("index.html"); }
function formatTime(milliseconds) { const total = Math.max(0, Math.ceil(milliseconds / 1000)); const h = String(Math.floor(total / 3600)).padStart(2, "0"); const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0"); const s = String(total % 60).padStart(2, "0"); return `${h}:${m}:${s}`; }
function disableExam() {
  clearInterval(timerId);
  document.querySelectorAll(".section-card").forEach(card => card.disabled = true);
  overlay.hidden = false;
}
async function markExpired() { try { await supabaseClient.from("participants").update({ status: "expired" }).eq("id", participantId); } catch (_) { /* Interface still locks if the network is unavailable. */ } }
function updateTimer(startedAt) { const remaining = new Date(startedAt).getTime() + DURATION_MS - Date.now(); countdown.textContent = formatTime(remaining); timerPanel.classList.toggle("warning", remaining > 5 * 60e3 && remaining <= 15 * 60e3); timerPanel.classList.toggle("critical", remaining > 0 && remaining <= 5 * 60e3); if (remaining <= 0) { countdown.textContent = "00:00:00"; markExpired(); disableExam(); } }

async function loadExam() {
  if (!participantId || !supabaseClient) return redirectToRegistration();
  try {
    const { data, error } = await supabaseClient.from("participants").select("name, started_at, status").eq("id", participantId).single();
    if (error || !data || !data.started_at) return redirectToRegistration();
    document.querySelector("#participant-name").textContent = data.name;
    if (data.status === "expired") return disableExam();

    // An active attempt must never show the expired overlay.
    overlay.hidden = true;
    document.querySelectorAll(".section-card").forEach(card => card.disabled = false);

    updateTimer(data.started_at);
    timerId = window.setInterval(() => updateTimer(data.started_at), 1000);
  } catch (_) { dashboardMessage.textContent = "Unable to load your competition session. Please check your connection and refresh."; }
}
document.querySelectorAll(".section-card").forEach(card => card.addEventListener("click", () => { dashboardMessage.textContent = `${card.dataset.section} will be available soon.`; }));
loadExam();
