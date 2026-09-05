document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const siteHeader = document.querySelector('.site-header');
const currentYear = document.querySelector('#current-year');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');
const toast = document.querySelector('#toast');
const revealItems = document.querySelectorAll('[data-reveal]');
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let scrollTicking = false;

const updateHeader = () => {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
  scrollTicking = false;
};

updateHeader();

window.addEventListener(
  'scroll',
  () => {
    if (scrollTicking) return;
    window.requestAnimationFrame(updateHeader);
    scrollTicking = true;
  },
  { passive: true },
);

revealItems.forEach((item) => {
  const delay = item.dataset.revealDelay;
  if (delay) {
    item.style.setProperty('--reveal-delay', `${delay}ms`);
  }
});

const revealAll = () => {
  revealItems.forEach((item) => item.classList.add('is-visible'));
};

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealAll();
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  revealItems.forEach((item) => {
    if (item.dataset.reveal === 'load') {
      requestAnimationFrame(() => item.classList.add('is-visible'));
      return;
    }
    revealObserver.observe(item);
  });
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  primaryNav?.classList.toggle('is-open', !isOpen);
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Nice start — connect this form to your email service when you are ready.';
});

document.querySelectorAll('.placeholder-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const projectName = link.dataset.project || 'This project';
    toast.textContent = `${projectName} is ready for your real link in index.html.`;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
  });
});

const galleryModal = document.querySelector('#gallery-modal');
const galleryTitle = document.querySelector('#gallery-title');
const galleryImage = document.querySelector('#gallery-image');
const galleryCaption = document.querySelector('#gallery-caption');
const galleryCounter = document.querySelector('#gallery-counter');
const galleryStatus = document.querySelector('#gallery-status');
const galleryThumbnails = document.querySelector('#gallery-thumbnails');
const galleryCloseButton = document.querySelector('#gallery-close');
const galleryFullscreenButton = document.querySelector('#gallery-fullscreen');
const galleryPreviousButton = document.querySelector('#gallery-prev');
const galleryNextButton = document.querySelector('#gallery-next');
const galleryTriggers = document.querySelectorAll('.gallery-trigger');

const healthyBodyGalleryVersion = '20260905';

const galleryCatalog = {
  healthybody: {
    title: 'Healthy Body Rehab',
    images: [1, 2, 3, 4].map((number) => ({
      src: `assets/images/healthybody/healthybody-${String(number).padStart(2, '0')}.jpg?v=${healthyBodyGalleryVersion}`,
      alt: `Healthy Body Rehab website screenshot ${number}`,
      caption: `Healthy Body Rehab — view ${number}`,
    })),
  },
  icg: {
    title: 'International Cabinets',
    images: [1, 2, 3, 4, 5, 6].map((number) => ({
      src: `assets/images/icg/icg-${String(number).padStart(2, '0')}.jpg`,
      alt: `International Cabinets Group Corp. website screenshot ${number}`,
      caption: `International Cabinets — view ${number}`,
    })),
  },
};

let activeGallery = null;
let activeGalleryIndex = 0;
let galleryReturnFocus = null;
let touchStart = null;

const getGalleryFocusables = () =>
  [...galleryModal.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hidden && element.getClientRects().length > 0,
  );

const updateFullscreenControl = () => {
  if (!galleryModal || !galleryFullscreenButton) return;
  const isFullscreen = document.fullscreenElement === galleryModal || galleryModal.classList.contains('is-fullscreen-fallback');
  galleryFullscreenButton.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  const label = galleryFullscreenButton.querySelector('.gallery-control-text');
  if (label) label.textContent = isFullscreen ? 'Exit fullscreen' : 'Fullscreen';
};

const setGallerySlide = (nextIndex, shouldAnnounce = true) => {
  if (!activeGallery || !galleryImage) return;

  const imageCount = activeGallery.images.length;
  activeGalleryIndex = (nextIndex + imageCount) % imageCount;
  const image = activeGallery.images[activeGalleryIndex];

  galleryImage.src = image.src;
  galleryImage.alt = image.alt;
  galleryCaption.textContent = image.caption;
  galleryCounter.textContent = `${String(activeGalleryIndex + 1).padStart(2, '0')} / ${String(imageCount).padStart(2, '0')}`;

  galleryThumbnails?.querySelectorAll('button').forEach((thumbnail, index) => {
    const isCurrent = index === activeGalleryIndex;
    thumbnail.classList.toggle('is-current', isCurrent);
    if (isCurrent) thumbnail.setAttribute('aria-current', 'true');
    else thumbnail.removeAttribute('aria-current');
  });

  if (shouldAnnounce && galleryStatus) {
    galleryStatus.textContent = `${activeGallery.title}, ${image.caption}, screenshot ${activeGalleryIndex + 1} of ${imageCount}.`;
  }

  const nextImage = new Image();
  nextImage.src = activeGallery.images[(activeGalleryIndex + 1) % imageCount].src;
};

const renderGalleryThumbnails = () => {
  if (!galleryThumbnails || !activeGallery) return;

  galleryThumbnails.replaceChildren();
  activeGallery.images.forEach((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumbnail';
    button.setAttribute('aria-label', `View ${image.caption}`);

    const thumbnail = document.createElement('img');
    thumbnail.src = image.src;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';
    button.append(thumbnail);
    button.addEventListener('click', () => setGallerySlide(index));
    galleryThumbnails.append(button);
  });
};

const openGallery = (galleryKey, trigger) => {
  const gallery = galleryCatalog[galleryKey];
  if (!galleryModal || !gallery) return;

  activeGallery = gallery;
  activeGalleryIndex = 0;
  galleryReturnFocus = trigger || document.activeElement;
  galleryTitle.textContent = gallery.title;
  renderGalleryThumbnails();
  setGallerySlide(0, false);
  galleryModal.hidden = false;
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('gallery-open');
  galleryModal.classList.remove('is-fullscreen-fallback');
  updateFullscreenControl();
  galleryCloseButton?.focus();
  if (galleryStatus) galleryStatus.textContent = `${gallery.title}, screenshot 1 of ${gallery.images.length}.`;
};

const closeGallery = () => {
  if (!galleryModal || galleryModal.hidden) return;

  if (document.fullscreenElement === galleryModal) {
    const exitPromise = document.exitFullscreen?.();
    exitPromise?.catch(() => {});
  }
  galleryModal.classList.remove('is-fullscreen-fallback');
  galleryModal.hidden = true;
  galleryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('gallery-open');
  activeGallery = null;
  if (galleryReturnFocus && typeof galleryReturnFocus.focus === 'function') galleryReturnFocus.focus();
};

const toggleGalleryFullscreen = async () => {
  if (!galleryModal || galleryModal.hidden) return;

  if (galleryModal.classList.contains('is-fullscreen-fallback')) {
    galleryModal.classList.remove('is-fullscreen-fallback');
    updateFullscreenControl();
    return;
  }

  if (document.fullscreenElement === galleryModal) {
    await document.exitFullscreen?.();
    return;
  }

  if (!galleryModal.requestFullscreen) {
    galleryModal.classList.add('is-fullscreen-fallback');
    updateFullscreenControl();
    return;
  }

  try {
    await galleryModal.requestFullscreen();
  } catch {
    galleryModal.classList.add('is-fullscreen-fallback');
  }
  updateFullscreenControl();
};

galleryTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openGallery(trigger.dataset.gallery, trigger));
});

galleryCloseButton?.addEventListener('click', closeGallery);
galleryFullscreenButton?.addEventListener('click', toggleGalleryFullscreen);
galleryPreviousButton?.addEventListener('click', () => setGallerySlide(activeGalleryIndex - 1));
galleryNextButton?.addEventListener('click', () => setGallerySlide(activeGalleryIndex + 1));
galleryModal?.querySelector('[data-gallery-close]')?.addEventListener('click', closeGallery);

galleryModal?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeGallery();
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    setGallerySlide(activeGalleryIndex - 1);
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    setGallerySlide(activeGalleryIndex + 1);
    return;
  }

  if (event.key !== 'Tab') return;
  const focusables = getGalleryFocusables();
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

galleryModal?.addEventListener(
  'touchstart',
  (event) => {
    if (event.touches.length !== 1) return;
    const [touch] = event.touches;
    touchStart = { x: touch.clientX, y: touch.clientY };
  },
  { passive: true },
);

galleryModal?.addEventListener(
  'touchend',
  (event) => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const [touch] = event.changedTouches;
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    setGallerySlide(activeGalleryIndex + (deltaX < 0 ? 1 : -1));
  },
  { passive: true },
);

document.addEventListener('fullscreenchange', updateFullscreenControl);
