(() => {
  const images = document.querySelectorAll('.case-page__cover img, .case-page__inline-image img');

  if (!images.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'case-lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<img class="case-lightbox__image" alt="">';
  document.body.appendChild(overlay);

  const overlayImage = overlay.querySelector('.case-lightbox__image');

  const close = () => {
    overlay.classList.remove('case-lightbox--open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    overlayImage.removeAttribute('src');
    overlayImage.alt = '';
  };

  const open = (image) => {
    overlayImage.src = image.currentSrc || image.src;
    overlayImage.alt = image.alt || '';
    overlay.classList.add('case-lightbox--open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  images.forEach((image) => {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.addEventListener('click', () => open(image));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(image);
      }
    });
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('case-lightbox--open')) {
      close();
    }
  });
})();
