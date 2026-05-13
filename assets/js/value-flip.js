(function () {
  const query = "(hover: none), (pointer: coarse)";
  const canTapFlip = window.matchMedia(query);

  function shouldTapFlip() {
    return canTapFlip.matches || window.innerWidth <= 1024;
  }

  function bindValueCards() {
    const cards = document.querySelectorAll(".value-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (!shouldTapFlip()) return;
        cards.forEach((item) => {
          if (item !== card) item.classList.remove("is-flipped");
        });
        card.classList.toggle("is-flipped");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindValueCards);
  } else {
    bindValueCards();
  }
})();
