/**
 * TeamOnTime OS — Contact Form EmailJS Production Integration
 * Single clean submit listener, submit button protection, zero PII logging.
 */
(function (window, document) {
  'use strict';

  /* EmailJS Production Credentials */
  var EMAILJS_PUBLIC_KEY = 'YGmJoloxshMb3Eya_';
  var EMAILJS_SERVICE_ID = 'teamontime_mail';
  var EMAILJS_TEMPLATE_ID = 'teamontime_partnership';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('engineering-intake-form');
    var feedback = document.getElementById('contact-form-feedback');
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (!form) return;

    console.log('[TeamOnTime Contact] initialized');

    /* Initialize EmailJS SDK */
    if (window.emailjs && EMAILJS_PUBLIC_KEY) {
      try {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (e) {
        console.warn('[TeamOnTime Contact] EmailJS init failed', e);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('[TeamOnTime Contact] submission started');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* Synchronize hidden template variables */
      var fullNameEl = document.getElementById('full-name');
      var emailEl = document.getElementById('work-email');
      var hiddenNameEl = document.getElementById('hidden-user-name');
      var hiddenEmailEl = document.getElementById('hidden-user-email');
      if (hiddenNameEl && fullNameEl) hiddenNameEl.value = fullNameEl.value;
      if (hiddenEmailEl && emailEl) hiddenEmailEl.value = emailEl.value;

      /* Submit Button Protection against rapid double-clicks */
      var originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Dispatching intake...';
      }

      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = 'rgba(255, 122, 0, 0.1)';
        feedback.style.border = '1px solid rgba(255, 122, 0, 0.3)';
        feedback.style.color = '#FFF';
        feedback.textContent = 'Dispatching intake specification to engineering desk...';
      }

      function restoreSubmitButton() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }

      if (window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        window.emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
          .then(function () {
            console.log('[TeamOnTime Contact] submission successful');
            restoreSubmitButton();
            if (window.TeamOnTimeAnalytics) {
              window.TeamOnTimeAnalytics.trackEvent('contact_form_submit', {
                form_location: 'contact',
                page_path: window.location.pathname,
                page_title: document.title
              });
            }
            if (feedback) {
              feedback.style.background = 'rgba(16, 185, 129, 0.15)';
              feedback.style.border = '1px solid #10B981';
              feedback.style.color = '#10B981';
              feedback.textContent = '✓ Intake specification dispatched successfully via EmailJS. Engineering leads respond within sub-2h SLA.';
            }
            form.reset();
          })
          .catch(function (err) {
            console.warn('[TeamOnTime Contact] submission failed', err && err.text ? err.text : err);
            restoreSubmitButton();
            if (feedback) {
              feedback.style.background = 'rgba(239, 68, 68, 0.15)';
              feedback.style.border = '1px solid #EF4444';
              feedback.style.color = '#EF4444';
              feedback.textContent = 'Intake transmission encountered a transport error. Connect directly at partners@teamontime.com.';
            }
          });
      } else {
        console.warn('[TeamOnTime Contact] submission failed: EmailJS SDK or credentials uninitialized');
        restoreSubmitButton();
        if (feedback) {
          feedback.style.background = 'rgba(239, 68, 68, 0.15)';
          feedback.style.border = '1px solid #EF4444';
          feedback.style.color = '#EF4444';
          feedback.textContent = 'EmailJS SDK uninitialized. Connect directly at partners@teamontime.com.';
        }
      }
    });
  });
})(window, document);
