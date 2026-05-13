(function () {
  const root = document.querySelector("[data-faq-accordion]");
  if (!root) return;

  const items = root.querySelectorAll("details.faq__item");
  if (!items.length) return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function runOnNextFrame(callback) {
    requestAnimationFrame(function () {
      requestAnimationFrame(callback);
    });
  }

  function expandItem(details, body) {
    details.dataset.animating = "true";
    details.open = true;

    runOnNextFrame(function () {
      details.classList.add("is-open");
    });

    const onTransitionEnd = function (event) {
      if (event.propertyName !== "grid-template-rows") return;
      details.dataset.animating = "false";
      body.removeEventListener("transitionend", onTransitionEnd);
    };

    body.addEventListener("transitionend", onTransitionEnd);
  }

  function collapseItem(details, body) {
    details.dataset.animating = "true";

    runOnNextFrame(function () {
      details.classList.remove("is-open");
    });

    const onTransitionEnd = function (event) {
      if (event.propertyName !== "grid-template-rows") return;
      details.open = false;
      details.dataset.animating = "false";
      body.removeEventListener("transitionend", onTransitionEnd);
    };

    body.addEventListener("transitionend", onTransitionEnd);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          const index = Number(item.dataset.faqIndex || 0);
          item.style.transitionDelay = (index * 70) + "ms";
          item.classList.add("is-visible");
          obs.unobserve(item);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    items.forEach(function (item, index) {
      item.dataset.faqIndex = String(index);
      observer.observe(item);
    });
  } else {
    items.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  items.forEach(function (details) {
    const summary = details.querySelector(".faq__summary");
    const body = details.querySelector(".faq__body");
    if (!summary || !body) return;

    summary.addEventListener("click", function (event) {
      event.preventDefault();
      if (details.dataset.animating === "true") return;

      if (prefersReducedMotion) {
        details.open = !details.open;
        details.classList.toggle("is-open", details.open);
        return;
      }

      if (details.open) {
        collapseItem(details, body);
      } else {
        expandItem(details, body);
      }
    });
  });
})();
