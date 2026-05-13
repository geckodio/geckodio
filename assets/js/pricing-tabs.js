document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-pricing-toggle]");
  if (!toggle) return;

  const buttons = toggle.querySelectorAll("[data-tab-target]");
  const panels = document.querySelectorAll("[data-tab-panel]");

  const activate = (target) => {
    buttons.forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.tabTarget === target));
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tabTarget));
  });
});
