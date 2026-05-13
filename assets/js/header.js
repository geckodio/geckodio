function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  initDropdowns(header);
  initBurger(header);
  initMobileToggles(header);
}

function initDropdowns(header) {
  const items = header.querySelectorAll('[data-dropdown]');

  const closeAll = (options = {}) => {
    if (options.instant) {
      header.setAttribute('data-dropdown-switching', 'true');
    }

    items.forEach((item) => {
      item.removeAttribute('data-dropdown-open');
      const trigger = item.querySelector('[data-dropdown-trigger]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
    header.removeAttribute('data-dropdown-active');

    if (options.instant) {
      requestAnimationFrame(() => {
        header.removeAttribute('data-dropdown-switching');
      });
    }
  };

  items.forEach((item) => {
    const trigger = item.querySelector('[data-dropdown-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = item.getAttribute('data-dropdown-open') === 'true';
      const hasAnotherOpen = Array.from(items).some((candidate) => {
        return candidate !== item && candidate.getAttribute('data-dropdown-open') === 'true';
      });

      closeAll({ instant: hasAnotherOpen });
      if (!isOpen) {
        const openCurrent = () => {
          item.setAttribute('data-dropdown-open', 'true');
          trigger.setAttribute('aria-expanded', 'true');
          header.setAttribute('data-dropdown-active', 'true');
        };

        if (hasAnotherOpen) {
          requestAnimationFrame(openCurrent);
        } else {
          openCurrent();
        }
      }
    });
  });

  const overlay = header.querySelector('[data-dropdown-overlay]');
  if (overlay) {
    overlay.addEventListener('click', closeAll);
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-dropdown]')) {
      closeAll();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });
}

function setMobileGroup(toggle, isOpen) {
  toggle.setAttribute('aria-expanded', String(isOpen));
  const sub = toggle.nextElementSibling;
  if (sub && sub.classList.contains('header__mobile-sub')) {
    sub.hidden = !isOpen;
  }
}

function closeMobileGroups(header) {
  header.querySelectorAll('[data-mobile-toggle]').forEach((toggle) => {
    setMobileGroup(toggle, false);
  });
}

function initBurger(header) {
  const burger = header.querySelector('[data-burger]');
  const panel = header.querySelector('[data-mobile-panel]');
  if (!burger || !panel) return;

  burger.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('no-scroll', isOpen);

    if (!isOpen) {
      closeMobileGroups(header);
    }
  });
}

function initMobileToggles(header) {
  const toggles = header.querySelectorAll('[data-mobile-toggle]');
  toggles.forEach((toggle) => {
    setMobileGroup(toggle, false);

    toggle.addEventListener('click', () => {
      const shouldOpen = toggle.getAttribute('aria-expanded') !== 'true';
      toggles.forEach((candidate) => {
        setMobileGroup(candidate, candidate === toggle && shouldOpen);
      });
    });
  });
}

document.addEventListener('partial:loaded', (event) => {
  if (event.detail && event.detail.slotId === 'header-slot') {
    initHeader();
  }
});
