// =============================================================
// Модалка обратной связи
// =============================================================
//
// =============================================================

const FORM_SERVICE = "telegram-api"; // "demo" | "telegram-api"

const FORM_CONFIG = {
  telegramApi: {
    endpoint: "/api/telegram",
  },
};

let lastFocusedElement = null;
let modalEl = null;

function initModal() {
  modalEl = document.querySelector("[data-modal]");
  if (!modalEl) return;

  bindOpeners();
  bindClosers();
  bindForm();
  document.addEventListener("keydown", onKeydown);
}

function bindOpeners() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-modal-open]");
    if (!trigger) return;
    event.preventDefault();
    openModal(trigger);
  });
}

function bindClosers() {
  modalEl.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]")) {
      event.preventDefault();
      closeModal();
    }
  });
}

function bindForm() {
  const form = modalEl.querySelector("[data-modal-form]");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;

    const submitBtn = form.querySelector(".modal__submit");
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    try {
      await submitForm(form);
      showSuccess();
    } catch (error) {
      console.error("[modal] Ошибка отправки:", error);
      alert("Не удалось отправить заявку. Попробуйте позже или напишите на hello@gekkodio.ru");
    } finally {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
    }
  });

  form.addEventListener("input", (event) => {
    const field = event.target.closest(".modal__field");
    if (!field) return;

    if (event.target.name === "phone") {
      normalizePhoneInput(event.target);
    }

    updateFieldState(form, event.target.name, "input");
  });

  form.addEventListener("focusout", (event) => {
    updateFieldState(form, event.target.name, "blur");
  });
}

function validateForm(form) {
  let isValid = true;

  ["name", "phone", "email", "message"].forEach((fieldName) => {
    const message = getFieldError(form, fieldName);
    setFieldState(form, fieldName, Boolean(message));
    if (message) {
      isValid = false;
    }
  });

  return isValid;
}

function updateFieldState(form, fieldName, eventType = "input") {
  if (!fieldName) return;
  const input = form.querySelector(`[name="${fieldName}"]`);
  if (!input) return;

  const value = input.value.trim();
  if (!value) {
    setFieldState(form, fieldName, false);
    return;
  }

  if (fieldName === "phone" && eventType === "input") {
    setFieldState(form, fieldName, Boolean(getPhoneLiveError(value)));
    return;
  }

  if (fieldName === "email" && eventType === "input") {
    setFieldState(form, fieldName, false);
    return;
  }

  setFieldState(form, fieldName, Boolean(getFieldError(form, fieldName)));
}

function getFieldError(form, fieldName) {
  const input = form.querySelector(`[name="${fieldName}"]`);
  if (!input) return "";
  const value = input.value.trim();

  if (fieldName === "name") {
    if (!value) return "Пожалуйста, укажите имя";
    if (/\d/.test(value)) return "В имени не должно быть цифр";
    return "";
  }

  if (fieldName === "phone") {
    if (!value) return "Укажите телефон";
    const liveError = getPhoneLiveError(value);
    if (liveError) return liveError;
    if (!isCompletePhone(value)) return "Введите полный номер";
    return "";
  }

  if (fieldName === "email") {
    if (!value) return "Укажите email";
    if (!isValidEmail(value)) return "Введите корректный email";
    return "";
  }

  if (fieldName === "message") {
    if (!value) return "Коротко опишите задачу";
    return "";
  }

  return "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhoneInput(input) {
  const raw = input.value;
  if (!raw) return;
  const trimmed = raw.trimStart();
  if (!trimmed || trimmed.startsWith("+")) return;

  if (trimmed[0] === "9") {
    const leadingSpaces = raw.match(/^\s*/)?.[0] || "";
    input.value = `${leadingSpaces}+7${trimmed}`;
  }
}

function getPhoneLiveError(value) {
  if (/[^\d\s+()-]/.test(value)) return "Введите телефон цифрами";
  const digits = value.replace(/\D/g, "");
  if (digits.length > 11) return "В номере должно быть не больше 11 цифр";

  const compact = value.replace(/[\s()-]/g, "");
  if (
    compact &&
    !"+79".startsWith(compact) &&
    !"89".startsWith(compact) &&
    !"79".startsWith(compact) &&
    !compact.startsWith("+79") &&
    !compact.startsWith("89") &&
    !compact.startsWith("79")
  ) {
    return "Введите номер в формате +79..., 89... или 79...";
  }

  return "";
}

function isCompletePhone(value) {
  const digits = value.replace(/\D/g, "");
  const compact = value.replace(/[\s()-]/g, "");
  return (
    digits.length === 11 &&
    (compact.startsWith("+79") || compact.startsWith("89") || compact.startsWith("79"))
  );
}

function setFieldState(form, fieldName, hasError) {
  const input = form.querySelector(`[name="${fieldName}"]`);
  if (!input) return;
  const field = input.closest(".modal__field");
  if (!field) return;
  field.classList.toggle("has-error", hasError);
}

async function submitForm(form) {
  const data = new FormData(form);

  if (FORM_SERVICE === "demo") {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return;
  }

  if (FORM_SERVICE === "telegram-api") {
    const payload = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      page: window.location.href,
    };

    const res = await fetch(FORM_CONFIG.telegramApi.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.error || "submit failed");
    return;
  }
}

function showSuccess() {
  const header = modalEl.querySelector(".modal__header");
  const form = modalEl.querySelector("[data-modal-form]");
  const success = modalEl.querySelector("[data-modal-success]");
  if (header) header.hidden = true;
  if (form) form.hidden = true;
  if (success) {
    success.hidden = false;
    const closeButton = success.querySelector("[data-modal-close]");
    if (closeButton) closeButton.focus();
  }
}

function resetModal() {
  const header = modalEl.querySelector(".modal__header");
  const form = modalEl.querySelector("[data-modal-form]");
  const success = modalEl.querySelector("[data-modal-success]");
  if (header) header.hidden = false;
  if (form) {
    form.reset();
    form.hidden = false;
    form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
  }
  if (success) success.hidden = true;
}

function openModal(trigger) {
  if (!modalEl) return;
  lastFocusedElement = trigger || document.activeElement;
  resetModal();
  modalEl.removeAttribute("hidden");
  modalEl.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => modalEl.classList.add("is-open"));
  document.body.classList.add("no-scroll");

  setTimeout(() => {
    const firstInput = modalEl.querySelector("input, textarea, button");
    if (firstInput) firstInput.focus();
  }, 100);

  modalEl.addEventListener("keydown", trapFocus);
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  modalEl.removeEventListener("keydown", trapFocus);

  setTimeout(() => {
    modalEl.setAttribute("hidden", "");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }, 280);
}

function onKeydown(event) {
  if (event.key === "Escape" && modalEl && modalEl.classList.contains("is-open")) {
    closeModal();
  }
}

function trapFocus(event) {
  if (event.key !== "Tab") return;
  const focusables = modalEl.querySelectorAll(
    'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  const visible = Array.from(focusables).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
  if (!visible.length) return;
  const first = visible[0];
  const last = visible[visible.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener("partial:loaded", (event) => {
  if (event.detail && event.detail.slotId === "modal-slot") {
    initModal();
  }
});
