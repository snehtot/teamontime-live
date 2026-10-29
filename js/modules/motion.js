/**
 * TEAMONTIME — ES MODULE MOTION ORCHESTRATOR (PHASE 04A)
 * Orchestrator module providing MotionOrchestrator class export for modular setups.
 */

export class MotionOrchestrator {
  constructor() {
    this.header = document.querySelector('.site-header') || document.getElementById('site-header');
    this.progressBar = document.getElementById('scroll-progress-bar');
    this.heroHudFrame = document.querySelector('.hero-hud-frame');
    this.heroHudCenter = document.querySelector('.hero-hud-center');
    this.hudPods = document.querySelectorAll('.hero-hud-pod');
    this.hudPaths = document.querySelectorAll('.hud-line-path');
    this.serviceRailPanels = document.querySelectorAll('.service-rail-panel');
    this.megaServiceItems = document.querySelectorAll('.mega-service-item');
    this.visualPanelStates = document.querySelectorAll('.visual-panel-state');
    this.contextNavLinks = document.querySelectorAll('.service-context-nav-link');
    this.faqItems = document.querySelectorAll('.faq-item');
  }

  init() {
    this.setupScrollProgress();
    this.setupHeaderScroll();
    this.setupContextNavScrollSpy();
    this.setupHeroHudInteractions();
    this.setupCapabilitiesRail();
    this.setupFaqAccordions();
    this.setupMegaMenuVisuals();
    this.setupStatCounters();
  }

  setupScrollProgress() {
    if (!this.progressBar) {
      this.progressBar = document.createElement('div');
      this.progressBar.id = 'scroll-progress-bar';
      this.progressBar.className = 'scroll-progress-bar';
      document.body.prepend(this.progressBar);
    }

    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = (window.scrollY / docHeight) * 100;
      this.progressBar.style.width = `${Math.min(progress, 100)}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  setupHeaderScroll() {
    if (!this.header) return;
    const update = () => {
      if (window.scrollY > 30) {
        this.header.classList.add('site-header--scrolled');
      } else {
        this.header.classList.remove('site-header--scrolled');
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  setupContextNavScrollSpy() {
    if (!this.contextNavLinks.length) return;
    const sections = Array.from(this.contextNavLinks)
      .map(link => {
        const hash = link.getAttribute('href');
        if (hash && hash.startsWith('#')) {
          const el = document.querySelector(hash);
          if (el) return { link, section: el };
        }
        return null;
      })
      .filter(Boolean);

    const update = () => {
      const scrollPos = window.scrollY + 200;
      let currentActive = null;

      sections.forEach(item => {
        if (item.section.offsetTop <= scrollPos) {
          currentActive = item;
        }
      });

      this.contextNavLinks.forEach(l => l.classList.remove('is-active'));
      if (currentActive) {
        currentActive.link.classList.add('is-active');
      } else if (sections.length > 0) {
        sections[0].link.classList.add('is-active');
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  setupHeroHudInteractions() {
    if (!this.hudPods.length) return;

    this.hudPods.forEach(pod => {
      pod.addEventListener('mouseenter', () => {
        const podId = pod.getAttribute('data-pod');
        this.hudPods.forEach(p => p.classList.remove('is-active'));
        pod.classList.add('is-active');

        this.hudPaths.forEach(path => {
          if (path.getAttribute('data-path') === podId) {
            path.classList.add('is-active');
          } else {
            path.classList.remove('is-active');
          }
        });
      });

      pod.addEventListener('mouseleave', () => {
        pod.classList.remove('is-active');
        this.hudPaths.forEach(path => path.classList.remove('is-active'));
      });
    });

    if (this.heroHudFrame && window.matchMedia('(min-width: 1024px)').matches) {
      let ticking = false;

      this.heroHudFrame.addEventListener('mousemove', (e) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const rect = this.heroHudFrame.getBoundingClientRect();
            const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            if (this.heroHudCenter) {
              this.heroHudCenter.style.transform = `translate(-50%, -50%) scale(1.03) translate(${normX * 4}px, ${normY * 4}px)`;
            }

            this.hudPods.forEach((pod, index) => {
              const depth = (index % 3 + 1) * 3;
              pod.style.transform = `translate(${normX * depth}px, ${normY * depth}px)`;
            });

            ticking = false;
          });
          ticking = true;
        }
      });

      this.heroHudFrame.addEventListener('mouseleave', () => {
        if (this.heroHudCenter) this.heroHudCenter.style.transform = 'translate(-50%, -50%) scale(1)';
        this.hudPods.forEach(pod => {
          if (!pod.classList.contains('is-active')) {
            pod.style.transform = 'translate(0px, 0px)';
          }
        });
      });
    }
  }

  setupCapabilitiesRail() {
    if (!this.serviceRailPanels.length || !window.matchMedia('(min-width: 1024px)').matches) return;

    this.serviceRailPanels.forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        this.serviceRailPanels.forEach(p => p.classList.remove('is-active'));
        panel.classList.add('is-active');
      });
    });
  }

  setupFaqAccordions() {
    if (!this.faqItems.length) return;
    this.faqItems.forEach((item, index) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (question && answer) {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        const questionId = `faq-q-mod-${index}`;
        const answerId = `faq-a-mod-${index}`;
        question.id = questionId;
        answer.id = answerId;
        question.setAttribute('aria-controls', answerId);

        const toggle = () => {
          const isOpen = item.classList.contains('is-open');
          this.faqItems.forEach(i => {
            i.classList.remove('is-open');
            const q = i.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            item.classList.add('is-open');
            question.setAttribute('aria-expanded', 'true');
          }
        };

        question.addEventListener('click', toggle);
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      }
    });
  }

  setupMegaMenuVisuals() {
    if (!this.megaServiceItems.length || !this.visualPanelStates.length) return;

    this.megaServiceItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const targetId = item.getAttribute('data-visual');
        this.megaServiceItems.forEach(i => i.classList.remove('is-hovered'));
        item.classList.add('is-hovered');

        this.visualPanelStates.forEach(panel => {
          if (panel.id === targetId) {
            panel.classList.add('is-active');
          } else {
            panel.classList.remove('is-active');
          }
        });
      });
    });
  }

  setupStatCounters() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
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
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    stats.forEach(stat => observer.observe(stat));
  }
}
