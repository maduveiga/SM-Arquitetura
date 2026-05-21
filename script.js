/* ============================================
   SM ARQUITETURA — JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---- Custom Cursor ---- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let cursorVisible = false;
  let animFrameId;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.12);
    cursorY = lerp(cursorY, mouseY, 0.12);
    if (cursor) {
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
    }
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }
    animFrameId = requestAnimationFrame(animateCursor);
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      cursor && cursor.classList.add('visible');
      cursorDot && cursorDot.classList.add('visible');
    }
  });

  document.addEventListener('mouseleave', function () {
    cursor && cursor.classList.remove('visible');
    cursorDot && cursorDot.classList.remove('visible');
    cursorVisible = false;
  });

  // Hover effect on interactive elements
  const interactives = document.querySelectorAll('a, button, [role="button"]');
  interactives.forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor && cursor.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cursor && cursor.classList.remove('hover'); });
  });

  animateCursor();

  /* ---- Header Scroll ---- */
  const header = document.getElementById('header');
  const scrollIndicator = document.getElementById('scrollIndicator');

  function onScroll() {
    const scrolled = window.scrollY > 60;
    header && header.classList.toggle('scrolled', scrolled);
    if (scrollIndicator) {
      scrollIndicator.classList.toggle('hidden', window.scrollY > 80);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile Menu ---- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    menuToggle && menuToggle.classList.toggle('active', menuOpen);
    mobileNav && mobileNav.classList.toggle('open', menuOpen);
    mobileNav && mobileNav.setAttribute('aria-hidden', String(!menuOpen));
    menuToggle && menuToggle.setAttribute('aria-expanded', String(menuOpen));
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  menuToggle && menuToggle.addEventListener('click', toggleMenu);

  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (menuOpen) toggleMenu();
    });
  });

  /* ---- Hero Video Carousel ---- */
  const heroVideos = document.querySelectorAll('.hero-video');
  const heroDots = document.querySelectorAll('.dot');
  let currentHero = 0;
  let heroTimer = null;
  const HERO_INTERVAL = 8000;

  function loadVideo(video) {
    if (video && video.paused) {
      video.load();
      video.play().catch(function () {});
    }
  }

  function switchHero(index) {
    heroVideos[currentHero].classList.remove('active');
    heroDots[currentHero] && heroDots[currentHero].classList.remove('active');

    currentHero = index;

    heroVideos[currentHero].classList.add('active');
    heroDots[currentHero] && heroDots[currentHero].classList.add('active');

    // Ensure next video starts playing
    const next = heroVideos[(currentHero + 1) % heroVideos.length];
    loadVideo(next);
  }

  function startHeroTimer() {
    heroTimer = setInterval(function () {
      switchHero((currentHero + 1) % heroVideos.length);
    }, HERO_INTERVAL);
  }

  heroDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      clearInterval(heroTimer);
      switchHero(i);
      startHeroTimer();
    });
  });

  // Initialize — preload second video
  if (heroVideos.length > 0) {
    heroVideos[0].play().catch(function () {});
    loadVideo(heroVideos[1]);
    startHeroTimer();
  }

  /* ---- Scroll Reveal (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---- Play projeto videos on hover ---- */
  const projetoItems = document.querySelectorAll('.projeto-item');
  projetoItems.forEach(function (item) {
    const video = item.querySelector('.projeto-video');
    if (!video) return;
    item.addEventListener('mouseenter', function () {
      video.play().catch(function () {});
    });
    item.addEventListener('mouseleave', function () {
      video.pause();
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Parallax on hero content (subtle) ---- */
  const heroContent = document.querySelector('.hero-content');
  function onScrollParallax() {
    if (!heroContent) return;
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
      heroContent.style.opacity = 1 - (scrollY / (window.innerHeight * 0.7));
    }
  }

  window.addEventListener('scroll', onScrollParallax, { passive: true });

  /* ---- About section number counter animation ---- */
  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const isFloat = typeof target === 'number' && !Number.isInteger(target);

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * ease);
      el.textContent = (current < 10 ? '0' : '') + current + (suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const hasPlus = text.includes('+');
          const hasPct = text.includes('%');
          const num = parseInt(text.replace(/\D/g, ''), 10);
          const suffix = hasPlus ? '+' : (hasPct ? '%' : '');
          animateCounter(el, num, suffix, 1400);
          statObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(function (el) { statObserver.observe(el); });

  /* ---- Section active nav highlight ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ---- Typewriter Effect for Portfolio ---- */
  const twTarget = document.getElementById('typewriter-target');
  if (twTarget) {
    const textToType = twTarget.getAttribute('data-text') || '';
    twTarget.textContent = '';
    const twObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        let i = 0;
        function typeChar() {
          if (i < textToType.length) {
            twTarget.textContent += textToType.charAt(i);
            i++;
            setTimeout(typeChar, 50);
          }
        }
        setTimeout(typeChar, 200);
        twObserver.disconnect();
      }
    }, { threshold: 0.5 });
    twObserver.observe(twTarget);
  }

})();
