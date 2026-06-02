/* ============================================================
   MAIN JS — Navigation, Scroll, Animations, Typing Effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initTypingAnimation();
  initMetricCounters();
  initSmoothScroll();
});

/* ---- NAVIGATION ---- */
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;

    // Update active nav link
    updateActiveNavLink();
  });

  // Mobile toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
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
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const scrollPos = window.scrollY + 200;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

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
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      }
    });
  });
}

/* ---- SCROLL REVEAL ---- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
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
      typingSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typingSpeed = 300; // Pause before next word
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

    // Ease out cubic
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
