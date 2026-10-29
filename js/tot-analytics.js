/**
 * TeamOnTime OS — Phase 10 Production Analytics & Attribution Engine
 * Single shared module for first-party attribution, event tracking, and GTM integration.
 * DNT-aware first-party event orchestration. Third-party analytics/services may be loaded through the site's configured tag-management layer.
 */
(function (window, document) {
  'use strict';

  if (window.TeamOnTimeAnalytics) return; // Prevent duplicate initialization

  /* 1. Do Not Track Detection */
  var isDNT = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';

  /* 2. First-Party Attribution Engine */
  function initAttribution() {
    try {
      if (!sessionStorage.getItem('tot_attribution')) {
        var params = new URLSearchParams(window.location.search);
        var attr = {
          utm_source: params.get('utm_source') || '',
          utm_medium: params.get('utm_medium') || '',
          utm_campaign: params.get('utm_campaign') || '',
          utm_term: params.get('utm_term') || '',
          utm_content: params.get('utm_content') || '',
          landing_page: window.location.href,
          landing_path: window.location.pathname,
          landing_timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('tot_attribution', JSON.stringify(attr));
      }
    } catch (e) {
      // Storage unavailable
    }
  }

  function getAttribution() {
    try {
      var data = sessionStorage.getItem('tot_attribution');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  /* 3. Central Event Dispatcher */
  window.dataLayer = window.dataLayer || [];

  function trackEvent(eventName, eventPayload) {
    if (isDNT) return;

    var attr = getAttribution();
    var payload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_pathname: window.location.pathname,
      page_title: document.title,
      utm_source: attr.utm_source || '',
      utm_medium: attr.utm_medium || '',
      utm_campaign: attr.utm_campaign || ''
    };

    if (eventPayload && typeof eventPayload === 'object') {
      for (var key in eventPayload) {
        if (Object.prototype.hasOwnProperty.call(eventPayload, key)) {
          /* Strict PII Protection: Never log sensitive personal info */
          if (!/email|phone|password|name|body|message/i.test(key)) {
            payload[key] = eventPayload[key];
          }
        }
      }
    }

    /* Push to GTM dataLayer */
    window.dataLayer.push(payload);

    /* Store in local sessionStorage log (max 50 events) */
    try {
      var log = JSON.parse(sessionStorage.getItem('tot_event_log') || '[]');
      log.push(payload);
      if (log.length > 50) log.shift();
      sessionStorage.setItem('tot_event_log', JSON.stringify(log));
    } catch (e) {}
  }

  /* Global API */
  window.TeamOnTimeAnalytics = {
    trackEvent: trackEvent,
    getAttribution: getAttribution,
    trackCalculatorStarted: function (data) {
      trackEvent('calculator_started', data || { tool_name: 'Agency Capacity Calculator' });
    },
    trackCalculatorCompleted: function (data) {
      trackEvent('calculator_completed', data || { tool_name: 'Agency Capacity Calculator' });
    },
    trackContactSubmitted: function (formId) {
      trackEvent('contact_submitted', { form_id: formId || 'engineering-intake-form' });
    },
    track: function (eventName, data) {
      trackEvent(eventName, data);
    }
  };

  /* Alias for Global Interaction Engine Telemetry */
  window.TOTAnalytics = window.TeamOnTimeAnalytics;

  /* Run Attribution Initialization */
  initAttribution();

  /* Fire page_view event on initialization */
  trackEvent('page_view', {});

  /* 4. Delegated Listeners (PDF Downloads, Proof Page, Commercial Hubs, Strategy Call) */
  document.addEventListener('DOMContentLoaded', function () {
    var path = window.location.pathname;

    /* Delegated PDF Download Tracking */
    document.body.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (/\.pdf$/i.test(href)) {
        var assetName = href.split('/').pop();
        trackEvent('pdf_downloaded', {
          asset_name: assetName,
          asset_path: href
        });
      }
    });

    /* Homepage & Commercial Specific Engagement Tracking */
    document.body.addEventListener('click', function (e) {
      var serviceLink = e.target.closest('.service-rail-panel');
      if (serviceLink) {
        var serviceTitle = serviceLink.querySelector('.service-rail-title') ? serviceLink.querySelector('.service-rail-title').textContent.trim() : 'Service';
        trackEvent('homepage_service_explored', { service_name: serviceTitle });
      }
      var caseCard = e.target.closest('.artifact-card');
      if (caseCard) {
        var caseTitle = caseCard.querySelector('h3') ? caseCard.querySelector('h3').textContent.trim() : 'Case Study';
        trackEvent('homepage_case_study_explored', { case_study_title: caseTitle });
      }
      var capCard = e.target.closest('.service-capability-card');
      if (capCard) {
        var capTitle = capCard.querySelector('.service-capability-title') ? capCard.querySelector('.service-capability-title').textContent.trim() : 'Capability';
        trackEvent('commercial_capability_explored', { capability: capTitle });
      }
      var workflowStage = e.target.closest('.service-workflow-stage');
      if (workflowStage) {
        var stageTitle = workflowStage.querySelector('.workflow-stage-title') ? workflowStage.querySelector('.workflow-stage-title').textContent.trim() : 'Stage';
        trackEvent('commercial_workflow_explored', { stage: stageTitle });
      }
      var filterBtn = e.target.closest('.case-studies-filter-btn');
      if (filterBtn) {
        var filterCategory = filterBtn.getAttribute('data-filter') || 'all';
        trackEvent('case_study_filtered', { category: filterCategory });
      }
    });

    /* Proof Page Viewed Tracking */
    if (path.indexOf('/proof') !== -1 || path.indexOf('proof/index') !== -1) {
      trackEvent('homepage_proof_viewed', { proof_hub: 'Proof Center' });
    }

    /* Commercial Page Viewed Tracking */
    var commercialHubs = {
      'white-label-shopify-development': 'Shopify White-Label Outsourcing',
      'shopify-white-label': 'Enterprise Shopify 2.0 Partner',
      'wordpress-white-label': 'WordPress Gutenberg Outsourcing',
      'search-engineering': 'Search Engineering & Technical SEO',
      'agency-partner': 'Agency Partner Program',
      'engineering-pods': 'Dedicated Engineering Pods',
      'ai-workforce': 'AI Workforce Solutions'
    };

    for (var key in commercialHubs) {
      if (path.indexOf(key) !== -1) {
        trackEvent('commercial_page_viewed', {
          service_name: commercialHubs[key],
          commercial_hub: key
        });
        break;
      }
    }

    /* Strategy Call Tracking */
    if (path.indexOf('strategy-call') !== -1) {
      var strategyTracked = false;
      var calendlyWrap = document.querySelector('.sc-calendly-frame-wrap, .sc-calendly-fallback, iframe');
      if (calendlyWrap) {
        calendlyWrap.addEventListener('click', function () {
          if (!strategyTracked) {
            strategyTracked = true;
            trackEvent('strategy_call_started', { source: 'calendly_wrap_interaction' });
          }
        });
      }

      /* Calendly PostMessage Completion Listener */
      window.addEventListener('message', function (e) {
        if (e.origin && e.origin.indexOf('calendly.com') !== -1 && e.data && e.data.event === 'calendly.event_scheduled') {
          trackEvent('strategy_call_booking', {
            form_location: 'strategy_call',
            page_path: window.location.pathname,
            page_title: document.title
          });
        }
      });
    }

    /* Pricing Page View Tracking */
    if (path.indexOf('/pricing') !== -1 || path === '/pricing' || path.indexOf('pricing.html') !== -1) {
      trackEvent('pricing_page_view', {
        page_path: window.location.pathname,
        page_title: document.title
      });
    }

    /* Service-Page 75% Scroll Depth Tracking */
    var servicePages = [
      'shopify-white-label',
      'wordpress-white-label',
      'search-engineering',
      'agency-partner',
      'ai-workforce',
      'engineering-pods',
      'dedicated-teams',
      'seo-reseller',
      'white-label-development-agency',
      'white-label-shopify',
      'white-label-wordpress'
    ];
    var isServicePage = servicePages.some(function (slug) {
      return path.indexOf(slug) !== -1;
    });

    if (isServicePage) {
      var serviceScroll75Tracked = false;
      var serviceScrollTicking = false;

      var checkServiceScrollDepth = function () {
        if (serviceScroll75Tracked) return;
        var winH = window.innerHeight || document.documentElement.clientHeight || 0;
        var docH = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight
        );
        var sTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        var scrollable = docH - winH;

        if (scrollable > 0) {
          var pct = ((sTop + winH) / docH) * 100;
          if (pct >= 75) {
            serviceScroll75Tracked = true;
            trackEvent('service_page_scroll_75', {
              page_path: window.location.pathname,
              page_title: document.title,
              scroll_percent: 75
            });
            window.removeEventListener('scroll', onServiceScroll);
          }
        }
      };

      var onServiceScroll = function () {
        if (!serviceScrollTicking && !serviceScroll75Tracked) {
          window.requestAnimationFrame(function () {
            checkServiceScrollDepth();
            serviceScrollTicking = false;
          });
          serviceScrollTicking = true;
        }
      };

      window.addEventListener('scroll', onServiceScroll, { passive: true });
      checkServiceScrollDepth();
    }

    /* ==========================================================================
       5. Phase 3.9 Engagement Analytics Expansion
       ========================================================================== */

    var sessionExploredServices = {};
    var sessionExploredStages = {};
    var sessionExploredComparisons = {};
    var sessionExploredCaseStudies = {};
    var sessionEngagedSections = {};

    /* 5A. Delegated Click & Interaction Listener */
    document.body.addEventListener('click', function (e) {
      /* 1. article_toc_used */
      var tocLink = e.target.closest('.article-toc-link, .article-toc__link');
      if (tocLink) {
        var anchor = tocLink.getAttribute('href') || '';
        var tocText = tocLink.textContent.trim();
        trackEvent('article_toc_used', {
          section_anchor: anchor,
          section_title: tocText
        });
      }

      /* 2. related_content_clicked */
      var relatedCardLink = e.target.closest('.article-related-section a, .editorial-card__link, .article-next-rail');
      if (relatedCardLink) {
        var isNextRail = !!relatedCardLink.closest('.article-next-rail');
        var targetHref = relatedCardLink.getAttribute('href') || '';
        var targetCard = relatedCardLink.closest('article, .article-next-rail');
        var targetTitle = targetCard && targetCard.querySelector('h3, h4, .article-next-rail__title') ? targetCard.querySelector('h3, h4, .article-next-rail__title').textContent.trim() : targetHref;
        trackEvent('related_content_clicked', {
          source_article: window.location.pathname.split('/').pop() || 'blog-hub',
          target_article: targetHref.split('/').pop(),
          target_title: targetTitle,
          click_location: isNextRail ? 'next_rail' : 'related_grid'
        });
      }

      /* 3. service_explored (Mega Menu, Service Cards, Header) */
      var megaItem = e.target.closest('.mega-service-item, .service-capability-card, .service-rail-panel');
      if (megaItem) {
        var sTitle = megaItem.querySelector('.mega-service-title, .service-capability-title, .service-rail-title, h3, h4') ? megaItem.querySelector('.mega-service-title, .service-capability-title, .service-rail-title, h3, h4').textContent.trim() : 'Service';
        if (!sessionExploredServices[sTitle]) {
          sessionExploredServices[sTitle] = true;
          trackEvent('service_explored', {
            service_name: sTitle,
            trigger_location: megaItem.classList.contains('mega-service-item') ? 'mega_menu' : 'service_card'
          });
        }
      }

      /* 4. workflow_explored */
      var wfStage = e.target.closest('.service-workflow-stage, .workflow-stage-card');
      if (wfStage) {
        var stageName = wfStage.querySelector('.workflow-stage-title, h3, h4') ? wfStage.querySelector('.workflow-stage-title, h3, h4').textContent.trim() : 'Workflow Stage';
        if (!sessionExploredStages[stageName]) {
          sessionExploredStages[stageName] = true;
          trackEvent('workflow_explored', {
            stage_name: stageName
          });
        }
      }

      /* 5. case_study_explored */
      var csCard = e.target.closest('.case-studies-card, .service-case-study, .artifact-card');
      if (csCard) {
        var csTitle = csCard.querySelector('.case-studies-card-title, h3, h4') ? csCard.querySelector('.case-studies-card-title, h3, h4').textContent.trim() : 'Case Study';
        if (!sessionExploredCaseStudies[csTitle]) {
          sessionExploredCaseStudies[csTitle] = true;
          trackEvent('case_study_explored', {
            case_study_title: csTitle
          });
        }
      }

      /* 6. resource_explored */
      var resItem = e.target.closest('.res-item, .editorial-card[data-category]');
      if (resItem) {
        var resTitle = resItem.querySelector('h3, h4, .editorial-card__title') ? resItem.querySelector('h3, h4, .editorial-card__title').textContent.trim() : 'Resource';
        var resCat = resItem.getAttribute('data-category') || 'general';
        trackEvent('resource_explored', {
          resource_title: resTitle,
          resource_category: resCat
        });
      }

      /* 7. cta_clicked */
      var ctaBtn = e.target.closest('.btn-primary, .btn-secondary, .magnetic-button, .article-contextual-cta a, a[href*="strategy-call"], a[href*="contact"], a[href*="free-audit"], a[href*="agency-partner"]');
      if (ctaBtn && !ctaBtn.hasAttribute('data-no-cta-track')) {
        var ctaText = ctaBtn.textContent.trim().replace(/\s+/g, ' ');
        var ctaHref = ctaBtn.getAttribute('href') || '';
        var ctaLocation = 'body';
        if (ctaBtn.closest('.site-header')) ctaLocation = 'header';
        else if (ctaBtn.closest('.site-footer')) ctaLocation = 'footer';
        else if (ctaBtn.closest('.hero-section, .editorial-hub__header')) ctaLocation = 'hero';
        else if (ctaBtn.closest('.article-contextual-cta')) ctaLocation = 'in_article';
        else if (ctaBtn.closest('.section--elevated, #final-cta')) ctaLocation = 'final_cta';

        trackEvent('cta_clicked', {
          cta_text: ctaText,
          cta_href: ctaHref,
          cta_location: ctaLocation
        });
      }

      /* 6. interactive_section_engaged (Accordion toggles, Filter pills, Calculators) */
      var faqToggle = e.target.closest('.service-faq-item, .faq-item, details, .editorial-filter-pill');
      if (faqToggle) {
        var isFilter = faqToggle.classList.contains('editorial-filter-pill');
        var sectionType = isFilter ? 'filter_pill' : 'faq_accordion';
        var sectionHeading = faqToggle.querySelector('summary, .faq-question, h3, h4');
        var sectionId = faqToggle.getAttribute('data-filter') || (sectionHeading ? sectionHeading.textContent.trim() : 'interactive_element');
        var secKey = sectionType + ':' + sectionId;
        if (!sessionEngagedSections[secKey]) {
          sessionEngagedSections[secKey] = true;
          trackEvent('interactive_section_engaged', {
            section_type: sectionType,
            section_id: sectionId
          });
        }
      }
    });

    /* 5B. comparison_explored (Split Slider & Comparison Tables) */
    var comparisonElems = document.querySelectorAll('[data-interaction="compare"], .article-table-wrap, .table-compare');
    comparisonElems.forEach(function (elem, idx) {
      var compId = elem.id || ('comparison-' + (idx + 1));
      var isSlider = elem.hasAttribute('data-interaction') && elem.getAttribute('data-interaction') === 'compare';
      var compType = isSlider ? 'split_slider' : 'matrix_table';

      var handleInteraction = function () {
        if (!sessionExploredComparisons[compId]) {
          sessionExploredComparisons[compId] = true;
          trackEvent('comparison_explored', {
            comparison_type: compType,
            component_id: compId
          });
        }
      };

      elem.addEventListener('mousedown', handleInteraction, { passive: true });
      elem.addEventListener('touchstart', handleInteraction, { passive: true });
      elem.addEventListener('scroll', handleInteraction, { passive: true });
    });

    /* 5C. Article Reading Depth Milestones (25%, 50%, 75%, completed) */
    var articleMain = document.querySelector('.article-main-content, article.article-body, main.article-page-wrap, #main-content article');
    if (articleMain) {
      var articleSlug = window.location.pathname.split('/').pop() || 'unknown-article';
      var articleStartTime = performance.now();
      var depthsTracked = {
        25: false,
        50: false,
        75: false,
        100: false
      };

      var checkReadingDepth = function () {
        var rect = articleMain.getBoundingClientRect();
        var totalHeight = rect.height;
        if (totalHeight <= 0) return;

        var windowHeight = window.innerHeight;
        var topOffset = rect.top;
        var visibleDepth = windowHeight - topOffset;
        var scrollPct = Math.min(100, Math.max(0, (visibleDepth / totalHeight) * 100));

        if (scrollPct >= 25 && !depthsTracked[25]) {
          depthsTracked[25] = true;
          trackEvent('article_depth_25', {
            article_slug: articleSlug,
            depth_percentage: 25
          });
        }

        if (scrollPct >= 50 && !depthsTracked[50]) {
          depthsTracked[50] = true;
          trackEvent('article_depth_50', {
            article_slug: articleSlug,
            depth_percentage: 50
          });
        }

        if (scrollPct >= 75 && !depthsTracked[75]) {
          depthsTracked[75] = true;
          trackEvent('article_depth_75', {
            article_slug: articleSlug,
            depth_percentage: 75
          });
        }

        if (scrollPct >= 90 && !depthsTracked[100]) {
          depthsTracked[100] = true;
          var durationSec = Math.round((performance.now() - articleStartTime) / 1000);
          trackEvent('article_completed', {
            article_slug: articleSlug,
            read_duration_seconds: durationSec
          });
          // Remove listener once article reading is fully completed
          window.removeEventListener('scroll', onScrollDepth);
        }
      };

      var depthTicking = false;
      var onScrollDepth = function () {
        if (!depthTicking) {
          requestAnimationFrame(function () {
            checkReadingDepth();
            depthTicking = false;
          });
          depthTicking = true;
        }
      };

      window.addEventListener('scroll', onScrollDepth, { passive: true });
      checkReadingDepth();
    }
  });

})(window, document);

