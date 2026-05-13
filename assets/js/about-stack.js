(function initAboutStack() {
  const col = document.querySelector('.about__cards-col');
  if (!col) return;

  const wrap = col.querySelector('.about__stack-wrap');
  const stack = col.querySelector('.about__stack');
  if (!wrap || !stack) return;

  const cards = Array.from(stack.querySelectorAll('.about__card'));
  if (cards.length < 2) return;

  const total = cards.length;
  let current = 0;

  /* ── Position assignment ─────────────────────────────────
     Each card gets one of: "0" (active), "-1" (prev, above),
     "1" (next, below), "hidden-prev" or "hidden-next".

     hidden-prev: pre-positioned above (translateY(-100%)) so
     it can smoothly fade in when it becomes prev (-1).
     hidden-next: pre-positioned below (translateY(100%)) so
     it can smoothly fade in when it becomes next (1).
  ──────────────────────────────────────────────────────── */

  function positionFor(circularPos) {
    if (circularPos === 0) return '0';
    if (circularPos === 1) return '1';
    if (circularPos === total - 1) return '-1';
    /* Split remaining cards: closer to "next" half → hidden-next,
       closer to "prev" half → hidden-prev                       */
    return circularPos <= Math.floor(total / 2) ? 'hidden-next' : 'hidden-prev';
  }

  function updateStack() {
    cards.forEach((card, i) => {
      const circPos = (i - current + total) % total;
      const displayPos = positionFor(circPos);

      card.dataset.stackPos = displayPos;
      card.style.pointerEvents = (displayPos === '0' || displayPos === '1' || displayPos === '-1') ? 'auto' : 'none';

      if (displayPos === '0' || displayPos === '1' || displayPos === '-1') {
        card.removeAttribute('aria-hidden');
      } else {
        card.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    updateStack();
  }

  const goNext = () => goTo(current + 1);
  const goPrev = () => goTo(current - 1);

  /* ── Autoplay ────────────────────────────────────────────── */

  const AUTOPLAY_INTERVAL = 4000;
  let autoplayTimer = null;
  let isPaused = false;

  function startAutoplay() {
    stopAutoplay();
    if (isPaused) return;
    autoplayTimer = setInterval(goNext, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  /* Any manual navigation resets the autoplay countdown so the
     next auto-advance happens a full interval later.          */
  function restartAutoplay() {
    if (isPaused) return;
    startAutoplay();
  }

  /* Pause while the section is out of view to avoid cycling
     through cards the user can't see.                        */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!isPaused) startAutoplay();
        } else {
          stopAutoplay();
        }
      });
    }, { threshold: 0.2 });
    io.observe(wrap);
  } else {
    startAutoplay();
  }

  /* Pause on hover / focus for better UX */
  wrap.addEventListener('mouseenter', () => { isPaused = true; stopAutoplay(); });
  wrap.addEventListener('mouseleave', () => { isPaused = false; startAutoplay(); });
  wrap.addEventListener('focusin', () => { isPaused = true; stopAutoplay(); });
  wrap.addEventListener('focusout', () => { isPaused = false; startAutoplay(); });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay(); else if (!isPaused) startAutoplay();
  });

  /* ── Click ───────────────────────────────────────────────── */

  stack.addEventListener('click', (e) => {
    const card = e.target.closest('.about__card');
    if (!card) return;

    const pos = card.dataset.stackPos;
    if (pos === '0') {
      goNext();
    } else if (pos === '1') {
      goNext();
    } else if (pos === '-1') {
      goPrev();
    }
    restartAutoplay();
  });

  /* ── Mouse wheel ─────────────────────────────────────────── */

  let wheelCooldown = false;
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelCooldown) return;
    wheelCooldown = true;
    if (e.deltaY > 0) goNext(); else goPrev();
    restartAutoplay();
    setTimeout(() => { wheelCooldown = false; }, 600);
  }, { passive: false });

  /* ── Touch swipe ─────────────────────────────────────────── */

  let touchStartY = 0;
  wrap.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  wrap.addEventListener('touchend', (e) => {
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) {
      if (dy > 0) goNext(); else goPrev();
      restartAutoplay();
    }
  }, { passive: true });

  /* ── Keyboard ────────────────────────────────────────────── */

  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('role', 'region');
  wrap.setAttribute('aria-label', 'Карточки - стрелки ↑↓ для навигации');

  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
      restartAutoplay();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
      restartAutoplay();
    }
  });

  /* ── Init ────────────────────────────────────────────────── */

  updateStack();
})();
