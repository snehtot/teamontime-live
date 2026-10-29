/**
 * TEAMONTIME — GLOBAL MOTION ENGINE & SERVICE-PAGE ORCHESTRATOR
 * Scroll progress, Header shrink, Hero HUD matrix, Sticky Service Sub-Nav Scroll-Spy,
 * Core Capabilities hover switcher, Interactive Workflow timeline, FAQ Accordion (single open + keyboard ARIA),
 * Architecture illuminator, Diagnostics stat count-up, Magnetic physics, and Mobile nav overlay.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- MASTER RAF SCROLL PIPELINE (Zero Layout Thrashing & 60fps/120fps Batching) ---
  const scrollSubscribers = [];
  const subscribeScroll = (fn) => scrollSubscribers.push(fn);

  let isScrollQueued = false;
  const dispatchScroll = () => {
    if (!isScrollQueued) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight - windowHeight;
        for (let i = 0; i < scrollSubscribers.length; i++) {
          scrollSubscribers[i](scrollY, windowHeight, docHeight);
        }
        isScrollQueued = false;
      });
      isScrollQueued = true;
    }
  };

  window.addEventListener('scroll', dispatchScroll, { passive: true });

  // 1. Scroll Progress Bar Generator & Updater
  let progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    progressBar.className = 'scroll-progress-bar';
    document.body.prepend(progressBar);
  }

  subscribeScroll((scrollY, windowHeight, docHeight) => {
    if (progressBar && docHeight > 0) {
      const progress = (scrollY / docHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
  });

  // 2. Dynamic Header Shrink
  const siteHeader = document.querySelector('.site-header') || document.getElementById('site-header');
  subscribeScroll((scrollY) => {
    if (siteHeader) {
      siteHeader.classList.toggle('site-header--scrolled', scrollY > 30);
    }
  });

  // 3. STICKY SERVICE CONTEXT NAVIGATION SCROLL-SPY (Cached Offsets)
  const serviceContextNavLinks = document.querySelectorAll('.service-context-nav-link');
  if (serviceContextNavLinks.length) {
    const sections = Array.from(serviceContextNavLinks)
      .map(link => {
        const hash = link.getAttribute('href');
        if (hash && hash.startsWith('#')) {
          const el = document.querySelector(hash);
          if (el) return { link, section: el, cachedTop: el.offsetTop };
        }
        return null;
      })
      .filter(Boolean);

    const refreshServiceOffsets = () => {
      sections.forEach(item => { item.cachedTop = item.section.offsetTop; });
    };
    window.addEventListener('resize', refreshServiceOffsets, { passive: true });

    subscribeScroll((scrollY) => {
      const scrollPos = scrollY + 200;
      let currentActive = null;

      for (let i = 0; i < sections.length; i++) {
        if (sections[i].cachedTop <= scrollPos) {
          currentActive = sections[i];
        }
      }

      serviceContextNavLinks.forEach(l => l.classList.remove('is-active'));
      if (currentActive) {
        currentActive.link.classList.add('is-active');
      } else if (sections.length > 0) {
        sections[0].link.classList.add('is-active');
      }
    });
  }

  // 3B. INNER SERVICE HERO AMBIENT MOTION & PARALLAX
  const innerHero = document.querySelector('.inner-service-hero');
  const innerHeroGlow = document.querySelector('.inner-service-hero__glow');

  if (innerHero && innerHeroGlow && !prefersReducedMotion) {
    subscribeScroll((scrollY) => {
      if (scrollY < 800) {
        innerHeroGlow.style.transform = `translate3d(-50%, calc(-50% + ${scrollY * 0.15}px), 0)`;
      }
    });
  }

  // Initial trigger
  dispatchScroll();

  // 4. HERO HUD INTERACTION ENGINE
  const hudPods = document.querySelectorAll('.hero-hud-pod');
  const hudPaths = document.querySelectorAll('.hud-line-path');
  const heroHudFrame = document.querySelector('.hero-hud-frame');
  const heroHudCenter = document.querySelector('.hero-hud-center');

  if (hudPods.length) {
    hudPods.forEach(pod => {
      pod.addEventListener('mouseenter', () => {
        const podId = pod.getAttribute('data-pod');
        hudPods.forEach(p => p.classList.remove('is-active'));
        pod.classList.add('is-active');

        hudPaths.forEach(path => {
          if (path.getAttribute('data-path') === podId) {
            path.classList.add('is-active');
          } else {
            path.classList.remove('is-active');
          }
        });
      });

      pod.addEventListener('mouseleave', () => {
        pod.classList.remove('is-active');
        hudPaths.forEach(path => path.classList.remove('is-active'));
      });
    });
  }

  // Controlled Mouse Parallax on Desktop (Capped to max 9px for hero stability)
  if (heroHudFrame && hudPods.length && !prefersReducedMotion && window.matchMedia('(min-width: 1024px)').matches) {
    let ticking = false;

    heroHudFrame.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = heroHudFrame.getBoundingClientRect();
          const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

          if (heroHudCenter) {
            heroHudCenter.style.transform = `translate(-50%, -50%) scale(1.03) translate(${normX * 4}px, ${normY * 4}px)`;
          }

          hudPods.forEach((pod, index) => {
            const depth = (index % 3 + 1) * 3;
            pod.style.transform = `translate(${normX * depth}px, ${normY * depth}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    });

    heroHudFrame.addEventListener('mouseleave', () => {
      if (heroHudCenter) heroHudCenter.style.transform = 'translate(-50%, -50%) scale(1)';
      hudPods.forEach(pod => {
        if (!pod.classList.contains('is-active')) {
          pod.style.transform = 'translate(0px, 0px)';
        }
      });
    });
  }

  // 5. CORE CAPABILITIES HORIZONTAL RAIL SWITCHER (DESKTOP)
  const serviceRailPanels = document.querySelectorAll('.service-rail-panel');
  if (serviceRailPanels.length && window.matchMedia('(min-width: 1024px)').matches) {
    serviceRailPanels.forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        serviceRailPanels.forEach(p => p.classList.remove('is-active'));
        panel.classList.add('is-active');
      });
    });
  }

  // 6. SHOPIFY WORKFLOW INTERACTIVE TIMELINE STAGE SWITCHER
  const workflowStages = document.querySelectorAll('.service-workflow-stage, .shopify-workflow-stage');
  if (workflowStages.length) {
    workflowStages.forEach(stage => {
      stage.addEventListener('mouseenter', () => {
        workflowStages.forEach(s => s.classList.remove('is-active'));
        stage.classList.add('is-active');
      });
    });
  }

  // 7. ACCESSIBLE SINGLE-OPEN FAQ ACCORDION HANDLER
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (question && answer) {
        // Accessibility semantics
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        const questionId = `faq-q-${index}`;
        const answerId = `faq-a-${index}`;
        question.id = questionId;
        answer.id = answerId;
        question.setAttribute('aria-controls', answerId);

        const toggleAccordion = () => {
          const isOpen = item.classList.contains('is-open');
          faqItems.forEach(i => {
            i.classList.remove('is-open');
            const q = i.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
            const a = i.querySelector('.faq-answer');
            if (a) a.style.maxHeight = null;
          });

          if (!isOpen) {
            item.classList.add('is-open');
            question.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = (answer.scrollHeight + 36) + 'px';
          }
        };

        question.addEventListener('click', toggleAccordion);
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAccordion();
          }
        });
      }
    });

    // Initialize any pre-opened FAQ items on load
    faqItems.forEach(item => {
      if (item.classList.contains('is-open')) {
        const a = item.querySelector('.faq-answer');
        const q = item.querySelector('.faq-question');
        if (a) a.style.maxHeight = (a.scrollHeight + 36) + 'px';
        if (q) q.setAttribute('aria-expanded', 'true');
      }
    });

    window.addEventListener('resize', () => {
      const openItem = document.querySelector('.faq-item.is-open');
      if (openItem) {
        const a = openItem.querySelector('.faq-answer');
        if (a) a.style.maxHeight = (a.scrollHeight + 36) + 'px';
      }
    }, { passive: true });
  }

  // 8. VISUAL BRIDGE NODE & ARCHITECTURE ILLUMINATION
  const archDiagram = document.querySelector('.architecture-diagram');
  if (archDiagram && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const archNodes = archDiagram.querySelectorAll('.arch-node');
    const archObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          archNodes.forEach((node, index) => {
            setTimeout(() => {
              node.style.borderColor = 'var(--color-accent)';
              node.style.boxShadow = '0 0 25px var(--color-accent-glow)';
            }, index * 200);
          });
          archObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    archObserver.observe(archDiagram);
  }

  // 9. SYSTEM DIAGNOSTICS STAT NUMERIC COUNT-UP
  const diagnosticNumbers = document.querySelectorAll('.stat-number');
  if (diagnosticNumbers.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.innerText.trim();
          const target = parseFloat(text.replace(/[^0-9.]/g, ''));
          const suffix = text.replace(/[0-9.]/g, '');

          if (!isNaN(target)) {
            const duration = 1500;
            const startTime = performance.now();

            const updateCount = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = progress * (2 - progress);
              const current = Math.floor(easeProgress * target);
              el.innerText = `${current}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.innerText = text;
              }
            };
            requestAnimationFrame(updateCount);
          }
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    diagnosticNumbers.forEach(stat => statObserver.observe(stat));
  }

  // 10. Desktop Mega Menu Dynamic Visual Panel Switcher
  const megaServiceItems = document.querySelectorAll('.mega-service-item');
  const visualPanelStates = document.querySelectorAll('.visual-panel-state');

  if (megaServiceItems.length && visualPanelStates.length) {
    megaServiceItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const targetId = item.getAttribute('data-visual');
        megaServiceItems.forEach(i => i.classList.remove('is-hovered'));
        item.classList.add('is-hovered');

        visualPanelStates.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.add('is-active');
          } else {
            panel.classList.remove('is-active');
          }
        });
      });
    });
  }

  // 11. Magnetic Button Physics (Desktop Pointer Devices Only)
  if (!prefersReducedMotion && window.matchMedia('(min-width: 1024px)').matches) {
    const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-button');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // 12. Mobile Navigation & Accordion Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileServicesToggle = document.querySelector('.mobile-services-toggle');
  const mobileAccordion = document.querySelector('.mobile-accordion-content');

  if (mobileToggle && mobileOverlay) {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const openMenu = () => {
      mobileOverlay.classList.add('is-active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';

      const firstFocusable = mobileOverlay.querySelectorAll(focusableSelector)[0];
      if (firstFocusable) firstFocusable.focus();
    };

    const closeMenu = () => {
      mobileOverlay.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      mobileToggle.focus();
    };

    mobileToggle.addEventListener('click', () => {
      const isActive = mobileOverlay.classList.contains('is-active');
      if (isActive) closeMenu();
      else openMenu();
    });

    // Trap focus inside mobileOverlay when active
    mobileOverlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(mobileOverlay.querySelectorAll(focusableSelector));
      if (!focusables.length) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    if (mobileServicesToggle && mobileAccordion) {
      mobileServicesToggle.setAttribute('role', 'button');
      if (!mobileServicesToggle.hasAttribute('tabindex')) mobileServicesToggle.setAttribute('tabindex', '0');
      mobileServicesToggle.setAttribute('aria-expanded', 'false');

      const toggleAccordion = (e) => {
        if (e) e.preventDefault();
        const isOpen = mobileAccordion.classList.toggle('is-open');
        mobileServicesToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const arrow = mobileServicesToggle.querySelector('.mobile-arrow');
        if (arrow) arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      };

      mobileServicesToggle.addEventListener('click', toggleAccordion);
      mobileServicesToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleAccordion(e);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     PHASE 3.2 — GLOBAL INTERACTION ENGINE UTILITIES
     ========================================================================== */

  // 13. Cursor-Aware Depth / Tilt Cards ([data-interaction="tilt"], .tot-card-depth)
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('[data-interaction="tilt"], .tot-card-depth');
    tiltCards.forEach(card => {
      let rafId = null;
      card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;
          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // 14. Hover & Focus Reveal Cards ([data-interaction="reveal"], .tot-hover-reveal)
  const revealCards = document.querySelectorAll('[data-interaction="reveal"], .tot-hover-reveal');
  revealCards.forEach(card => {
    const target = card.querySelector('.tot-reveal-target, .tot-hover-reveal__content');
    if (target) {
      target.setAttribute('aria-hidden', 'true');
      const show = () => {
        card.classList.add('is-revealed');
        target.setAttribute('aria-hidden', 'false');
      };
      const hide = () => {
        card.classList.remove('is-revealed');
        target.setAttribute('aria-hidden', 'true');
      };
      card.addEventListener('mouseenter', show);
      card.addEventListener('mouseleave', hide);
      card.addEventListener('focusin', show);
      card.addEventListener('focusout', hide);
    }
  });

  // 15. Interactive Comparison Split Slider ([data-interaction="compare"])
  const compareSliders = document.querySelectorAll('[data-interaction="compare"]');
  compareSliders.forEach(container => {
    const overlay = container.querySelector('.tot-compare-overlay');
    const handle = container.querySelector('.tot-compare-handle');
    if (overlay && handle) {
      let isDragging = false;
      const updatePos = (clientX) => {
        const rect = container.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));
        const pct = (offsetX / rect.width) * 100;
        overlay.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handle.style.left = `${pct}%`;
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        requestAnimationFrame(() => updatePos(x));
      };

      const stop = () => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('is-dragging');
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', stop);
        window.removeEventListener('touchend', stop);
      };

      const start = (e) => {
        isDragging = true;
        container.classList.add('is-dragging');
        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('mouseup', stop);
        window.addEventListener('touchend', stop);
        onMove(e);
      };

      container.addEventListener('mousedown', start);
      container.addEventListener('touchstart', start, { passive: true });
    }
  });

  // 16. Number & Metric Counter Reveal ([data-interaction="counter"], .tot-metric-counter)
  const counterElems = document.querySelectorAll('[data-interaction="counter"], .tot-metric-counter');
  if (counterElems.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetVal = parseFloat(el.getAttribute('data-target') || el.textContent.replace(/[^0-9.]/g, '')) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const duration = parseInt(el.getAttribute('data-duration') || '1500', 10);
          let startTime = null;

          const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = (easeProgress * targetVal).toFixed(decimals);
            el.textContent = `${prefix}${parseFloat(currentVal).toLocaleString()}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              el.textContent = `${prefix}${targetVal.toLocaleString()}${suffix}`;
            }
          };

          if (!prefersReducedMotion) {
            requestAnimationFrame(animateCount);
          } else {
            el.textContent = `${prefix}${targetVal.toLocaleString()}${suffix}`;
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElems.forEach(el => counterObserver.observe(el));
  }

  // 17. Scroll-Triggered Narrative Sequences ([data-interaction="narrative"])
  const narrativeContainers = document.querySelectorAll('[data-interaction="narrative"]');
  if (narrativeContainers.length > 0 && 'IntersectionObserver' in window) {
    const narrativeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const steps = entry.target.querySelectorAll('.tot-narrative-step');
        if (entry.isIntersecting) {
          steps.forEach((step, idx) => {
            setTimeout(() => {
              step.classList.add('is-active');
              step.setAttribute('aria-hidden', 'false');
            }, idx * 150);
          });
        }
      });
    }, { threshold: 0.15 });

    narrativeContainers.forEach(c => narrativeObserver.observe(c));
  }

  // 18. Reading Progress Indicator (.tot-reading-progress, [data-interaction="reading-progress"])
  const progressBars = document.querySelectorAll('.tot-reading-progress, [data-interaction="reading-progress"]');
  const mainContent = document.querySelector('#main-content, main, article');
  if (progressBars.length > 0 && mainContent && !prefersReducedMotion) {
    subscribeScroll(() => {
      const rect = mainContent.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = totalHeight > 0 ? Math.min(100, Math.max(0, (scrolled / totalHeight) * 100)) : 0;
      for (let i = 0; i < progressBars.length; i++) {
        progressBars[i].style.width = `${pct}%`;
        progressBars[i].setAttribute('aria-valuenow', Math.round(pct));
      }
    });
  }

  // 19. Section Exploration Dwell Telemetry ([data-interaction="explore"])
  const exploreSections = document.querySelectorAll('[data-interaction="explore"]');
  if (exploreSections.length > 0 && 'IntersectionObserver' in window) {
    const dwellTimes = new Map();
    const exploreObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id || entry.target.getAttribute('data-section-name') || 'unnamed-section';
        if (entry.isIntersecting) {
          dwellTimes.set(sectionId, performance.now());
        } else if (dwellTimes.has(sectionId)) {
          const durationSec = Math.round((performance.now() - dwellTimes.get(sectionId)) / 1000);
          dwellTimes.delete(sectionId);
          if (durationSec >= 3 && window.TOTAnalytics && typeof window.TOTAnalytics.track === 'function') {
            window.TOTAnalytics.track('section_dwell', { section: sectionId, duration_seconds: durationSec });
          }
        }
      });
    }, { threshold: 0.5 });

    exploreSections.forEach(s => exploreObserver.observe(s));
  }

  /* ==========================================================================
     PHASE 3.7 — EDITORIAL HUB & ARTICLE MASTER DESIGN SYSTEM
     ========================================================================== */

  // 20. Editorial Hub Real-Time Search & Category Filter Engine
  const hubSearchInput = document.getElementById('blog-search-input') || document.getElementById('editorial-search-input');
  const hubFilterPills = document.querySelectorAll('.editorial-filter-pill, .os-filter-pill');
  const hubCards = document.querySelectorAll('.editorial-card, .article-item, .os-bento-card');
  const hubFeatured = document.getElementById('featured-article') || document.querySelector('.editorial-featured');
  const hubEmpty = document.getElementById('blog-empty-state') || document.getElementById('editorial-empty-state') || document.querySelector('.editorial-empty');
  const hubResetBtn = document.getElementById('blog-reset-btn') || document.getElementById('editorial-reset-btn');

  if (hubSearchInput || hubFilterPills.length > 0) {
    let activeCategory = 'all';

    const filterEditorialHub = () => {
      const query = hubSearchInput ? hubSearchInput.value.toLowerCase().trim() : '';
      let visibleCount = 0;

      hubCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const title = card.querySelector('h2, h3, .editorial-card__title, .os-art-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('p, .editorial-card__excerpt, .os-art-excerpt')?.textContent.toLowerCase() || '';
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();

        const matchesCat = (activeCategory === 'all' || cat === activeCategory || cat.includes(activeCategory));
        const matchesQuery = (query === '' || title.includes(query) || excerpt.includes(query) || keywords.includes(query));

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (hubFeatured) {
        const featCat = hubFeatured.getAttribute('data-category') || '';
        const featTitle = hubFeatured.querySelector('h2, h3, .editorial-featured__title, .os-art-title')?.textContent.toLowerCase() || '';
        const featExcerpt = hubFeatured.querySelector('p, .editorial-featured__excerpt, .os-art-excerpt')?.textContent.toLowerCase() || '';
        const featMatchesCat = (activeCategory === 'all' || featCat === activeCategory || featCat.includes(activeCategory));
        const featMatchesQuery = (query === '' || featTitle.includes(query) || featExcerpt.includes(query));

        if (featMatchesCat && featMatchesQuery) {
          hubFeatured.style.display = 'block';
          visibleCount++;
        } else {
          hubFeatured.style.display = 'none';
        }
      }

      if (hubEmpty) {
        hubEmpty.style.display = (visibleCount === 0) ? 'block' : 'none';
      }
    };

    hubFilterPills.forEach(pill => {
      const isInitialActive = pill.classList.contains('is-active') || pill.classList.contains('active');
      pill.setAttribute('aria-pressed', isInitialActive ? 'true' : 'false');

      pill.addEventListener('click', (e) => {
        e.preventDefault();
        hubFilterPills.forEach(p => {
          p.classList.remove('is-active', 'active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('is-active', 'active');
        pill.setAttribute('aria-pressed', 'true');
        activeCategory = pill.getAttribute('data-filter') || 'all';
        filterEditorialHub();
      });
    });

    if (hubSearchInput) {
      hubSearchInput.addEventListener('input', filterEditorialHub);
    }

    if (hubResetBtn) {
      hubResetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (hubSearchInput) hubSearchInput.value = '';
        activeCategory = 'all';
        hubFilterPills.forEach((p, idx) => {
          if (idx === 0) {
            p.classList.add('is-active', 'active');
            p.setAttribute('aria-pressed', 'true');
          } else {
            p.classList.remove('is-active', 'active');
            p.setAttribute('aria-pressed', 'false');
          }
        });
        filterEditorialHub();
      });
    }
  }

  // 21. Article Sticky Table of Contents Scroll-Spy (Cached Offsets + Master RAF Loop)
  const tocLinks = document.querySelectorAll('.article-toc-link, .article-toc__link');
  if (tocLinks.length > 0) {
    const tocTargets = Array.from(tocLinks).map(link => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        const target = document.querySelector(hash);
        if (target) return { link, target, cachedTop: target.offsetTop };
      }
      return null;
    }).filter(Boolean);

    if (tocTargets.length > 0) {
      const refreshTocOffsets = () => {
        for (let i = 0; i < tocTargets.length; i++) {
          tocTargets[i].cachedTop = tocTargets[i].target.offsetTop;
        }
      };
      window.addEventListener('resize', refreshTocOffsets, { passive: true });

      subscribeScroll((scrollY) => {
        const scrollPos = scrollY + 140;
        let currentActive = null;

        for (let i = 0; i < tocTargets.length; i++) {
          if (tocTargets[i].cachedTop <= scrollPos) {
            currentActive = tocTargets[i];
          }
        }

        for (let i = 0; i < tocLinks.length; i++) {
          tocLinks[i].classList.remove('is-active');
        }
        if (currentActive) {
          currentActive.link.classList.add('is-active');
        } else if (tocTargets.length > 0) {
          tocTargets[0].link.classList.add('is-active');
        }
      });
    }
  }

  // 22. Article Share & Copy Link Handler
  const shareButtons = document.querySelectorAll('.article-share-btn');
  shareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const shareType = btn.getAttribute('data-share');
      const pageUrl = window.location.href;
      const pageTitle = document.title;

      if (shareType === 'copy') {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>✓ Copied!</span>';
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 2000);
          }).catch(() => {
            window.prompt('Copy article link:', pageUrl);
          });
        } else {
          window.prompt('Copy article link:', pageUrl);
        }
      } else if (shareType === 'twitter') {
        e.preventDefault();
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
      } else if (shareType === 'linkedin') {
        e.preventDefault();
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
        window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
      }
    });
  });

  /* ==========================================================================
     PHASE 5.1 — TACTILE INTERACTION & ENGAGEMENT ENGINES
     ========================================================================== */

  // 23. Context-Aware Desktop Cursor Exploration Layer (Pointer Fine Only)
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const cursorDot = document.createElement('div');
    cursorDot.className = 'tot-cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.className = 'tot-cursor-ring';
    const cursorLabel = document.createElement('span');
    cursorLabel.className = 'tot-cursor-ring__label';
    cursorRing.appendChild(cursorLabel);

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let cursorRafId = null;

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;

      cursorRafId = requestAnimationFrame(renderCursor);
    };

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        cursorRafId = requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
      if (cursorRafId) cancelAnimationFrame(cursorRafId);
    });

    // Delegate hover contexts
    const isArticlePage = Boolean(document.querySelector('.article-page-wrap, .article-shell'));

    document.body.addEventListener('mouseover', (e) => {
      if (!isVisible) return;
      const exploreTarget = e.target.closest('.case-studies-card, .artifact-card, [data-cursor="explore"]');
      const dragTarget = e.target.closest('[data-interaction="compare"], [data-cursor="drag"]');
      const interactiveTarget = e.target.closest('.btn, button, a, .editorial-filter-pill, .case-studies-filter-btn, .article-toc-link, .article-share-btn');
      const proseReadingTarget = isArticlePage && e.target.closest('.article-prose, .article-takeaways, .article-hero-section');

      if (exploreTarget && !proseReadingTarget) {
        cursorRing.classList.add('is-hovering-explore');
        cursorRing.classList.remove('is-hovering-drag', 'is-hovering-interactive');
        cursorLabel.textContent = 'EXPLORE';
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      } else if (dragTarget && !proseReadingTarget) {
        cursorRing.classList.add('is-hovering-drag');
        cursorRing.classList.remove('is-hovering-explore', 'is-hovering-interactive');
        cursorLabel.textContent = 'DRAG';
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      } else if (interactiveTarget) {
        cursorRing.classList.add('is-hovering-interactive');
        cursorRing.classList.remove('is-hovering-explore', 'is-hovering-drag');
        cursorLabel.textContent = '';
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      } else if (proseReadingTarget) {
        cursorRing.classList.remove('is-hovering-explore', 'is-hovering-drag', 'is-hovering-interactive');
        cursorLabel.textContent = '';
        cursorDot.style.opacity = '0.2';
        cursorRing.style.opacity = '0';
      } else {
        cursorRing.classList.remove('is-hovering-explore', 'is-hovering-drag', 'is-hovering-interactive');
        cursorLabel.textContent = '';
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    });
  }

  // 24. Radial Spotlight Tracking on Interactive Cards
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const spotlightCards = document.querySelectorAll('.editorial-card, .case-studies-card, .artifact-card, .service-capability-card');
    spotlightCards.forEach(card => {
      let cardTicking = false;
      card.addEventListener('mousemove', (e) => {
        if (!cardTicking) {
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            cardTicking = false;
          });
          cardTicking = true;
        }
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', `-500px`);
        card.style.setProperty('--mouse-y', `-500px`);
      });
    });
  }

  // 25. Entrance Motion & Scroll Reveal Orchestrator
  const revealElements = document.querySelectorAll('.editorial-card, .case-studies-card, .artifact-card, .service-capability-card, .service-workflow-stage');
  if (revealElements.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('tot-reveal-up'));

    const entranceObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => entranceObserver.observe(el));
  }
});


