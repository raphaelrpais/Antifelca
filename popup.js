/**
 * Antifelca — popup.js
 */

const toggleEl  = document.getElementById("toggleEnabled");
const dotEl     = document.getElementById("statusDot");
const statusEl  = document.getElementById("statusText");
const statPage  = document.getElementById("statPage");
const statTotal = document.getElementById("statTotal");
const btnScan   = document.getElementById("btnScan");
const btnReset  = document.getElementById("btnReset");
const toastEl   = document.getElementById("toast");

// ─── Toast ─────────────────────────────────────────────────────────────────

function showToast(msg, duration = 1800) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), duration);
}

// ─── Estado do toggle ──────────────────────────────────────────────────────

function applyEnabled(enabled) {
  dotEl.classList.toggle("off", !enabled);
  statusEl.textContent = enabled
    ? "Monitorando age gates…"
    : "Bypass desativado";
}

toggleEl.addEventListener("change", () => {
  const val = toggleEl.checked;
  applyEnabled(val);
  sendToContent({ type: "SET_ENABLED", value: val });
  showToast(val ? "✓ Bypass ativado" : "✗ Bypass desativado");
});

// ─── Scan manual ──────────────────────────────────────────────────────────

btnScan.addEventListener("click", () => {
  sendToContent({ type: "MANUAL_SCAN" });
  showToast("🔍 Escaneando…");
});

// ─── Reset ────────────────────────────────────────────────────────────────

btnReset.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "RESET_TOTAL" }, () => {
    statPage.textContent  = "0";
    statTotal.textContent = "0";
    showToast("🗑 Contador zerado");
  });
});

// ─── Envio ao content script ──────────────────────────────────────────────

function sendToContent(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, msg);
  });
}

// ─── Mensagens em tempo real (clique detectado enquanto popup aberto) ──────

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "AGE_GATE_CLICKED") {
    statPage.textContent  = msg.count;
    statTotal.textContent = msg.globalTotal ?? statTotal.textContent;
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────

// 1. Busca total global persistido no background
chrome.runtime.sendMessage({ type: "GET_GLOBAL_TOTAL" }, (res) => {
  if (res) statTotal.textContent = res.globalTotal || 0;
});

// 2. Busca status + contagem da aba atual via content script
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]) return;
  chrome.tabs.sendMessage(tabs[0].id, { type: "GET_STATUS" }, (res) => {
    if (chrome.runtime.lastError || !res) return;
    toggleEl.checked     = res.enabled;
    applyEnabled(res.enabled);
    statPage.textContent = res.clicks || 0;
  });
});
