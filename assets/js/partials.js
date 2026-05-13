const PARTIALS_VERSION = "partials-20260511-blue-1";

function withVersion(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${PARTIALS_VERSION}`;
}

async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  try {
    const response = await fetch(withVersion(url), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Не удалось загрузить ${url} (${response.status})`);
    }

    const html = await response.text();
    const placeholder = document.createElement("div");
    placeholder.innerHTML = html.trim();
    const node = placeholder.firstElementChild;

    if (node) {
      slot.replaceWith(node);
    } else {
      slot.outerHTML = html;
    }

    document.dispatchEvent(
      new CustomEvent("partial:loaded", { detail: { slotId, url } })
    );
  } catch (error) {
    console.error("[partials] Ошибка загрузки:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const partials = [
    { slot: "header-slot", url: "partials/header.html" },
    { slot: "footer-slot", url: "partials/footer.html" },
    { slot: "modal-slot", url: "partials/modal.html" },
  ];

  Promise.all(partials.map((p) => loadPartial(p.slot, p.url))).then(() => {
    document.dispatchEvent(new CustomEvent("partials:ready"));
  });
});
