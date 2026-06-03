/* ============================================================
   MAIN JS — Bento Grid: Cursor Glow, Card Tilt, Staggered
   Reveal, Floating Nav, Typing Effect, Metric Counters
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initFloatingNav();
  initStaggeredReveal();
  initCardTilt();
  initTypingAnimation();
  initMetricCounters();
  initSmoothScroll();
});

/* ---- CURSOR GLOW ---- */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  // Only on desktop
  if (window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
    });

    // Smooth follow with lerp
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }
}

/* ---- FLOATING NAV ---- */
function initFloatingNav() {
  const nav = document.getElementById('floating-nav');
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  if (!nav) return;

  // Scroll effect
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 60) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        updateActiveNavLink();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Mobile toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

function updateActiveNavLink() {
  const elements = document.querySelectorAll('.bento-card[id], section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const scrollPos = window.scrollY + 250; // offset slightly for active section triggering

  elements.forEach((el) => {
    const top = el.offsetTop;
    const height = el.offsetHeight;
    const id = el.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ---- SMOOTH SCROLL ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---- STAGGERED REVEAL ---- */
function initStaggeredReveal() {
  const elements = document.querySelectorAll('.bento-card, .reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the reveal by index within the batch
          const delay = index * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.05, // trigger reveal slightly earlier
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ---- CARD TILT (3D Perspective) ---- */
function initCardTilt() {
  // Only on desktop
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.bento-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

/* ---- TYPING ANIMATION ---- */
function initTypingAnimation() {
  const element = document.getElementById('typing-text');
  if (!element) return;

  const titles = [
    'AI Engineer',
    'Agentic AI Engineer',
    'LLM Engineer',
    'RAG Specialist',
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function type() {
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
      element.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      element.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typingSpeed = 300;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ---- METRIC COUNTERS ---- */
function initMetricCounters() {
  const counters = document.querySelectorAll('[data-metric]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

function animateCounter(element) {
  const target = parseFloat(element.getAttribute('data-metric'));
  const duration = 1500;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;

    element.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = isDecimal ? target.toFixed(2) : target;
    }
  }

  requestAnimationFrame(update);
}

/* ---- RESIZE HANDLER ---- */
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-check any responsive logic
  }, 250);
});
