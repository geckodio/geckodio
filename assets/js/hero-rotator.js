(function initHeroRotator() {
  const el = document.querySelector("[data-hero-rotator]");
  if (!el) return;

  const words = [
    "цифровые решения",
    "сайты и веб-приложения",
    "фирменный стиль",
    "автоматизацию процессов",
    "интеграции с нейросетями",
  ];

  const INTERVAL_MS = 3200;
  const FADE_MS = 520;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const mobileMQ = window.matchMedia("(max-width: 578px)");

  let index = 0;
  let intervalId = null;

  function resetStatic() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    el.classList.remove("is-leaving", "is-entering");
    el.textContent = words[0];
    index = 0;
  }

  function startRotation() {
    if (intervalId) return;

    intervalId = setInterval(() => {
      el.classList.add("is-leaving");

      setTimeout(() => {
        index = (index + 1) % words.length;
        el.textContent = words[index];

        el.classList.remove("is-leaving");
        el.classList.add("is-entering");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.classList.remove("is-entering");
          });
        });
      }, FADE_MS);
    }, INTERVAL_MS);
  }

  function update() {
    if (prefersReducedMotion || mobileMQ.matches) {
      resetStatic();
    } else {
      startRotation();
    }
  }

  if (typeof mobileMQ.addEventListener === "function") {
    mobileMQ.addEventListener("change", update);
  } else if (typeof mobileMQ.addListener === "function") {
    mobileMQ.addListener(update);
  }

  update();
})();
