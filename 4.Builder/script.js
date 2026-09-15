// footer year
document.getElementById('year').textContent = new Date().getFullYear();

// header shadow on scroll
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

// mobile nav
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', open);
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
  });
});

// one hero entrance sequence, runs once the page has loaded
window.addEventListener('load', () => {
  document.querySelector('.hero').classList.add('is-ready');
});

// stat counters — count up from 0 whenever the bar scrolls into view
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out so it settles instead of stopping dead
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(tick);
}

const statsBar = document.getElementById('statsBar');
let statsAnimated = false;
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statsBar.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.4 });
statsObserver.observe(statsBar);

// contact form validation — kept simple, no backend here
const form = document.getElementById('contactForm');
const successBox = document.getElementById('formSuccess');

function setError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = form.querySelector(`[data-error-for="${fieldId}"]`);
  field.closest('.field').classList.toggle('has-error', Boolean(message));
  if (errorEl) errorEl.textContent = message || '';
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById('fName').value.trim();
  if (name.length < 2) {
    setError('fName', 'Please tell us your name.');
    valid = false;
  } else {
    setError('fName', '');
  }

  const phone = document.getElementById('fPhone').value.trim();
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    setError('fPhone', 'Enter a valid phone number.');
    valid = false;
  } else {
    setError('fPhone', '');
  }

  const email = document.getElementById('fEmail').value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    setError('fEmail', 'Enter a valid email address.');
    valid = false;
  } else {
    setError('fEmail', '');
  }

  const message = document.getElementById('fMessage').value.trim();
  if (message.length < 10) {
    setError('fMessage', 'Give us a couple more details, please.');
    valid = false;
  } else {
    setError('fMessage', '');
  }

  if (!valid) return;

  // no backend wired up yet — just show a confirmation and reset
  successBox.hidden = false;
  form.reset();
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
