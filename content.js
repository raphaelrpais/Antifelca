/**
 * Age Gate Bypass — content.js
 * Detecta e clica automaticamente em botões de confirmação de idade.
 */

(() => {
  // ─── Configuração ──────────────────────────────────────────────────────────

  const CONFIG_KEY = "agb_enabled";
  let isEnabled = true;
  let clickCount = 0;

  // Palavras-chave que indicam um botão de CONFIRMAÇÃO de maioridade
  const CONFIRM_PATTERNS = [
    // Português
    /\bsim\b/i,
    /\btenho\s*(mais\s*de\s*)?\d{2}/i,
    /\bsou\s*maior/i,
    /\bmaior\s*de\s*idade/i,
    /\bconfirmar?\b/i,
    /\baceitar?\b/i,
    /\bentrar?\b/i,
    /\bacessar?\b/i,
    /\bprosseguir?\b/i,
    /\bcontinuar?\b/i,
    /^18\+?\s*$/i,

    // Inglês
    /\byes\b/i,
    /\bi\s*am\s*(over\s*)?\d{2}/i,
    /\benter\b/i,
    /\bconfirm\b/i,
    /\bi\s*agree\b/i,
    /\bverify\b/i,
    /\bproceed\b/i,
    /\bcontinue\b/i,
    /\ballow\b/i,
    /i'?m\s*(over\s*)?(18|21)/i,
    /of\s*legal\s*age/i,

    // Espanhol / outros
    /\bsí\b/i,
    /\btengo\s*\+?\d{2}/i,
    /\bsoy\s*mayor/i,
    /\baceptar?\b/i,
  ];

  // Palavras-chave que indicam que a PÁGINA ou MODAL é uma verificação de idade
  const AGE_GATE_CONTEXT = [
    /\bage\s*(gate|check|verif|confirm|restrict)/i,
    /verifica[çc][aã]o\s*de\s*idade/i,
    /confirma[çc][aã]o\s*de\s*idade/i,
    /maior\s*de\s*(18|21)/i,
    /\+\s*(18|21)/i,
    /18\s*\+/i,
    /you\s*must\s*be\s*(at\s*least\s*)?\d{2}/i,
    /are\s*you\s*(over|at\s*least)\s*\d{2}/i,
    /\badult\s*content\b/i,
    /conteúdo\s*adulto/i,
    /conteudo\s*adulto/i,
    /adults?\s*only/i,
    /only\s*for\s*adults/i,
    /somente\s*para\s*maiores/i,
    /entrada\s*proibida\s*para\s*menores/i,
    /legal\s*drinking\s*age/i,
    /drinking\s*age/i,
    /tobacco|cigarro|álcool|alcool|cannabis|vaping/i,
  ];

  // Seletores CSS comuns de age gates
  const AGE_GATE_SELECTORS = [
    "[class*='age-gate']",
    "[class*='agegate']",
    "[class*='age_gate']",
    "[id*='age-gate']",
    "[id*='agegate']",
    "[id*='age_gate']",
    "[class*='age-check']",
    "[class*='agecheck']",
    "[id*='age-check']",
    "[id*='age-verify']",
    "[class*='age-verify']",
    "[class*='adult']",
    "[id*='adult']",
    "[class*='age-wall']",
    "[class*='age-modal']",
    "[class*='age-popup']",
    "[class*='age-overlay']",
    "[data-age-gate]",
  ];

  // ─── Utilitários ───────────────────────────────────────────────────────────

  function getVisibleText(el) {
    return (el.innerText || el.textContent || "").trim();
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    );
  }

  function matchesConfirm(text) {
    return CONFIRM_PATTERNS.some((re) => re.test(text));
  }

  function isAgeGateContext(text) {
    return AGE_GATE_CONTEXT.some((re) => re.test(text));
  }

  // ─── Lógica principal ──────────────────────────────────────────────────────

  /**
   * Dado um elemento raiz (modal, overlay, ou document),
   * tenta encontrar e clicar o botão de confirmação de idade.
   */
  function tryClickConfirmIn(root) {
    if (!isEnabled) return false;

    const rootText = getVisibleText(root);

    // Só age se o contexto indicar verificação de idade
    if (!isAgeGateContext(rootText)) return false;

    const candidates = root.querySelectorAll(
      "button, a[href], input[type=button], input[type=submit], [role=button], label"
    );

    // Ordena: prefere botões que NÃO mencionam "não", "no", "sair", etc.
    const DENY_PATTERNS = [
      /\bn[aã]o\b/i, /\bno\b/i, /\bsair\b/i, /\bexit\b/i,
      /\bcancel/i, /\brecusar/i, /\brefuse/i, /\bunder/i,
      /\bmenor\b/i, /\bvoltar\b/i,
    ];

    let best = null;

    for (const el of candidates) {
      if (!isVisible(el)) continue;
      const text = getVisibleText(el);
      if (!text) continue;

      const isDeny = DENY_PATTERNS.some((re) => re.test(text));
      if (isDeny) continue;

      if (matchesConfirm(text)) {
        best = el;
        break; // primeiro match válido
      }
    }

    // Fallback: se só há UM botão visível no contexto, clica nele
    if (!best) {
      const visible = [...candidates].filter((el) => isVisible(el) && getVisibleText(el));
      if (visible.length === 1) best = visible[0];
    }

    if (best) {
      console.info("[Antifelca] Clicando:", getVisibleText(best));
      best.click();
      clickCount++;
      notifyBackground();
      return true;
    }

    return false;
  }

  /**
   * Varre o documento inteiro em busca de age gates.
   */
  function scanDocument() {
    if (!isEnabled) return;

    // 1. Verificar seletores específicos de age gate
    for (const sel of AGE_GATE_SELECTORS) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (isVisible(el)) {
          if (tryClickConfirmIn(el)) return;
        }
      }
    }

    // 2. Verificar overlays / modais visíveis genéricos
    const modals = document.querySelectorAll(
      "[role=dialog], [role=alertdialog], .modal, .overlay, .popup, .dialog, [class*='modal'], [class*='overlay'], [class*='popup'], [class*='dialog']"
    );
    for (const modal of modals) {
      if (isVisible(modal)) {
        if (tryClickConfirmIn(modal)) return;
      }
    }

    // 3. Verificar se a própria página inteira é um age gate (ex: páginas de verificação dedicadas)
    if (document.body && isAgeGateContext(getVisibleText(document.body))) {
      tryClickConfirmIn(document.body);
    }
  }

  // ─── Comunicação com background ───────────────────────────────────────────

  function notifyBackground() {
    chrome.runtime.sendMessage({ type: "AGE_GATE_CLICKED", count: clickCount });
  }

  // ─── Observador de mutações ────────────────────────────────────────────────

  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
      if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "style" || mutation.attributeName === "class")
      ) {
        shouldScan = true;
        break;
      }
    }

    if (shouldScan) {
      // Pequeno delay para o DOM terminar de renderizar
      setTimeout(scanDocument, 120);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class", "hidden", "aria-hidden"],
  });

  // ─── Mensagens do popup ────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_STATUS") {
      sendResponse({ enabled: isEnabled, clicks: clickCount });
    }
    if (msg.type === "SET_ENABLED") {
      isEnabled = msg.value;
      chrome.storage.local.set({ [CONFIG_KEY]: isEnabled });
      sendResponse({ ok: true });
    }
    if (msg.type === "MANUAL_SCAN") {
      scanDocument();
      sendResponse({ ok: true });
    }
  });

  // ─── Init ──────────────────────────────────────────────────────────────────

  chrome.storage.local.get([CONFIG_KEY], (result) => {
    if (result[CONFIG_KEY] === false) {
      isEnabled = false;
    }
    // Scan inicial com leve atraso
    setTimeout(scanDocument, 300);
    setTimeout(scanDocument, 1200); // segunda passagem para SPAs lentas
  });
})();
