(() => {
  const items = document.querySelectorAll(".service-audience__item");

  if (!items.length) {
    return;
  }

  let activeTimer = 0;

  const clearActive = () => {
    window.clearTimeout(activeTimer);
    items.forEach((item) => item.classList.remove("is-touch-active"));
  };

  items.forEach((item) => {
    item.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType !== "touch") {
          return;
        }

        clearActive();
        item.classList.add("is-touch-active");
        activeTimer = window.setTimeout(() => {
          item.classList.remove("is-touch-active");
        }, 900);
      },
      { passive: true }
    );

    item.addEventListener("pointercancel", clearActive, { passive: true });
  });
})();
