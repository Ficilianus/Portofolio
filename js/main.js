/**
 * PORTFOLIO – main.js
 * Handles: Dark Mode, Photo Swap, Project Sliders, Horizontal Drag Scroll,
 *          AOS Init, Nav Highlight, Smooth Scroll
 */

/* =====================================================
   1. DARK / LIGHT MODE TOGGLE
   ===================================================== */
function initThemeToggle() {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  // Read saved preference or default to light
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'dark') {
    html.classList.add('dark');
    icon.className = 'fa-solid fa-sun';
  }

  btn.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');

    // Small bounce animation
    btn.style.transform = 'scale(0.85) rotate(20deg)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
}

/* =====================================================
   2. PHOTO SWAP (HERO)
   ===================================================== */
function initPhotoSwap() {
  const photo1 = document.getElementById('photo-1');
  const photo2 = document.getElementById('photo-2');
  const flipBtn = document.getElementById('photo-flip-btn');

  if (!flipBtn) return;

  let isFlipped = false;

  flipBtn.addEventListener('click', () => {
    isFlipped = !isFlipped;

    // Trigger spin animation on button
    flipBtn.classList.add('spinning');
    setTimeout(() => flipBtn.classList.remove('spinning'), 500);

    if (isFlipped) {
      photo1.classList.add('hidden-photo');
      photo2.classList.remove('hidden-photo');
    } else {
      photo2.classList.add('hidden-photo');
      photo1.classList.remove('hidden-photo');
    }
  });
}

/* =====================================================
   3. INTERNAL CARD SLIDERS (Projects)
   ===================================================== */
function initCardSliders() {
  const sliders = document.querySelectorAll('.card-slider');

  sliders.forEach(slider => {
    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slider-slide');
    const dots = slider.querySelectorAll('.slider-dot');
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Dot clicks
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch / swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    // Auto-play every 4s
    let timer = setInterval(() => goTo(current + 1), 4000);
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 4000); });

    // Init
    goTo(0);
  });
}

/* =====================================================
   4. HORIZONTAL DRAG-TO-SCROLL CONTAINERS
   ===================================================== */
function initDragScroll() {
  const containers = document.querySelectorAll('.cards-scroll-container');

  containers.forEach(container => {
    let isDragging = false;
    let startX, scrollLeft;

    container.addEventListener('mousedown', e => {
      isDragging = true;
      container.style.userSelect = 'none';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.userSelect = '';
    });

    container.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    });

    // Prevent link clicks after drag
    container.addEventListener('click', e => {
      if (Math.abs(container.scrollLeft - scrollLeft) > 4) e.preventDefault();
    });
  });
}

/* =====================================================
   5. SCROLL NAVIGATION BUTTONS (Projects / Certs)
   ===================================================== */
function initScrollNavButtons() {
  const sections = document.querySelectorAll('[data-scroll-section]');

  sections.forEach(section => {
    const containerId = section.dataset.scrollSection;
    const container = document.getElementById(containerId);
    const prevBtn = section.querySelector('[data-scroll-prev]');
    const nextBtn = section.querySelector('[data-scroll-next]');

    if (!container || !prevBtn || !nextBtn) return;

    const SCROLL_AMOUNT = 340;

    function updateButtons() {
      prevBtn.disabled = container.scrollLeft <= 0;
      nextBtn.disabled = container.scrollLeft >= container.scrollWidth - container.clientWidth - 4;
    }

    prevBtn.addEventListener('click', () => {
      container.scrollLeft -= SCROLL_AMOUNT;
      setTimeout(updateButtons, 350);
    });

    nextBtn.addEventListener('click', () => {
      container.scrollLeft += SCROLL_AMOUNT;
      setTimeout(updateButtons, 350);
    });

    container.addEventListener('scroll', updateButtons);
    updateButtons();
  });
}

/* =====================================================
   6. MOBILE NAV MENU
   ===================================================== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const icon = hamburger.querySelector('i');
    icon.className = mobileMenu.classList.contains('open')
      ? 'fa-solid fa-xmark'
      : 'fa-solid fa-bars';
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelector('i').className = 'fa-solid fa-bars';
    });
  });
}

/* =====================================================
   7. ACTIVE NAV LINK ON SCROLL
   ===================================================== */
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55%' });

  sections.forEach(sec => observer.observe(sec));
}

/* =====================================================
   8. NAVBAR SHADOW ON SCROLL
   ===================================================== */
function initNavShadow() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

/* =====================================================
   9. TYPED ROLE TEXT EFFECT (Hero)
   ===================================================== */
function initTypedEffect() {
  const el = document.getElementById('typed-role');
  if (!el) return;

  const roles = [
    'Informatics Student',
    'Machine Learning',
    'Problem Solver',

  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const current = roles[roleIdx];

    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 65 : 110;

    if (!isDeleting && charIdx === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}

/* =====================================================
   10. AOS INIT
   ===================================================== */
function initAOS() {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
  });
}

/* =====================================================
   11. SKILL TAGS STAGGER ANIMATION
   ===================================================== */
function initSkillStagger() {
  const tags = document.querySelectorAll('.skill-tag');
  tags.forEach((tag, i) => {
    tag.style.animationDelay = `${i * 0.04}s`;
  });
}

/* =====================================================
   INIT ALL
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPhotoSwap();
  initCardSliders();
  initDragScroll();
  initScrollNavButtons();
  initMobileNav();
  initNavHighlight();
  initNavShadow();
  initTypedEffect();
  initAOS();
  initSkillStagger();
});
