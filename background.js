/**
 * Antifelca — background.js
 * Service worker: contagem por aba + contador global + tooltip no hover.
 */

const tabStats  = {};   // { tabId: contagem nessa aba }
let globalTotal = 0;    // total acumulado na sessão

const STORAGE_KEY = "antifelca_global_total";

// ─── Recupera total salvo ao iniciar ──────────────────────────────────────
chrome.storage.local.get([STORAGE_KEY], (res) => {
  globalTotal = res[STORAGE_KEY] || 0;
  refreshDefaultTitle();
});

// ─── Utilitários ──────────────────────────────────────────────────────────

function refreshDefaultTitle() {
  const title = globalTotal > 0
    ? `Antifelca — ${globalTotal} modal${globalTotal !== 1 ? "is" : ""} dispensado${globalTotal !== 1 ? "s" : ""}`
    : "Antifelca — nenhum modal dispensado ainda";
  chrome.action.setTitle({ title });
}

function updateTabTitle(tabId) {
  const pageCount  = tabStats[tabId] || 0;
  const pageLabel  = pageCount === 1 ? "1 modal dispensado nesta página" : `${pageCount} modais dispensados nesta página`;
  const totalLabel = globalTotal === 1 ? "1 no total" : `${globalTotal} no total`;
  const title      = `Antifelca ✓  ${pageLabel} · ${totalLabel}`;
  chrome.action.setTitle({ title, tabId });
}

// ─── Listener de mensagens do content script ──────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AGE_GATE_CLICKED" && sender.tab) {
    const tabId = sender.tab.id;

    tabStats[tabId] = (tabStats[tabId] || 0) + 1;
    globalTotal++;

    chrome.storage.local.set({ [STORAGE_KEY]: globalTotal });

    chrome.action.setBadgeText({ text: String(tabStats[tabId]), tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e", tabId });

    updateTabTitle(tabId);
    sendResponse && sendResponse({ ok: true, globalTotal });
  }

  if (msg.type === "GET_GLOBAL_TOTAL") {
    sendResponse({ globalTotal });
  }

  if (msg.type === "RESET_TOTAL") {
    globalTotal = 0;
    chrome.storage.local.set({ [STORAGE_KEY]: 0 });
    Object.keys(tabStats).forEach((id) => delete tabStats[id]);
    chrome.action.setTitle({ title: "Antifelca — nenhum modal dispensado ainda" });
    sendResponse({ ok: true });
  }

  return true; // mantém canal aberto para sendResponse assíncrono
});

// ─── Limpa contagem da aba ao navegar ─────────────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    delete tabStats[tabId];
    chrome.action.setBadgeText({ text: "", tabId });
    refreshDefaultTitle();
  }
});

// ─── Ao trocar de aba, garante tooltip correto ────────────────────────────
chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (tabStats[tabId]) {
    updateTabTitle(tabId);
  } else {
    refreshDefaultTitle();
  }
});
