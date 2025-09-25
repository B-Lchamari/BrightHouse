// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Sticky navigation
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Fade-in animation
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(element => {
        observer.observe(element);
    });
});

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-container') && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});




//Fetch API for form submission
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        message: form.message.value,
      };

      function ensureMsgElem() {
        let msgElem = form.querySelector('.form-message');
        const submitBtn = form.querySelector('#submitBtn') || form.querySelector('button[type="submit"]');
        if (!msgElem) {
          msgElem = document.createElement('div');
          msgElem.className = 'form-message';
          // Accessibility: announce status changes to assistive tech
          msgElem.setAttribute('role', 'status');
          msgElem.setAttribute('aria-live', 'polite');
          msgElem.setAttribute('aria-atomic', 'true');
          // Insert the message element right above the submit button
          if (submitBtn && submitBtn.parentNode) {
            submitBtn.parentNode.insertBefore(msgElem, submitBtn);
          } else {
            // Fallback to prepend if submit button isn't found
            form.prepend(msgElem);
          }
        }
        return msgElem;
      }

  // timers to manage auto-dismiss and redirect
  let dismissTimer = null;
  let redirectTimer = null;
  let countdownInterval = null;

      function clearTimers() {
        if (dismissTimer) {
          clearTimeout(dismissTimer);
          dismissTimer = null;
        }
        if (redirectTimer) {
          clearTimeout(redirectTimer);
          redirectTimer = null;
        }
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }

      function showFormMessage(message, type, options = {}) {
        const msgElem = ensureMsgElem();
        clearTimers();

        // prepare content: allow spinner for 'Sending...'
        let inner = '';
        if (type === 'info') {
          // lightweight inline spinner (SVG) and message text
          inner = `
            <span class="msg-spinner" aria-hidden="true">\n              <svg width="18" height="18" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">\n                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="5"/>\n                <path d="M45 25a20 20 0 0 1-20 20" fill="none" stroke="#fff" stroke-width="5">\n                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>\n                </path>\n              </svg>\n            </span>\n            <span class="msg-text">${message}</span>`;
        } else {
          inner = `<span class="msg-text">${message}</span>`;
        }

        // Add optional action button(s) (for consent to redirect)
        if (options.showProceed) {
          // include only progress bar for visibility and feedback (no countdown)
          inner += ` <div class="msg-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="msg-progress-bar"></div></div> <button type="button" class="msg-action msg-proceed">Proceed</button> `;
        }

        // Reset classes to restart animation
        msgElem.className = 'form-message';
        // small timeout ensures class reset before adding type
        setTimeout(() => {
          msgElem.innerHTML = inner;
          msgElem.className = `form-message ${type}`;

          // attach action handlers if present
          const proceedBtn = msgElem.querySelector('.msg-proceed');
          const stayBtn = msgElem.querySelector('.msg-stay');
          if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
              // immediate redirect if user consents
              if (options.onProceed) options.onProceed();
              clearTimers();
            });
          }
          if (stayBtn) {
            stayBtn.addEventListener('click', () => {
              // cancel redirect and dismiss
              clearTimers();
              // show a small info message that will dismiss after a shorter time
              showFormMessage('You chose to stay on this page.', 'info', { autoDismiss: true, dismissAfter: options.stayDismissAfter || 3000 });
            });
          }

          // start countdown & progress if redirect behavior requested
          if (options.showProceed && options.redirectDelay) {
            const countdownEl = msgElem.querySelector('.msg-countdown');
            const progressBarEl = msgElem.querySelector('.msg-progress-bar');
            let secondsLeft = Math.ceil(options.redirectDelay / 1000);
            const totalSeconds = secondsLeft;
            if (countdownEl) countdownEl.textContent = `(${secondsLeft}s)`;
            if (progressBarEl) progressBarEl.style.width = `0%`;

            countdownInterval = setInterval(() => {
              secondsLeft -= 1;
              if (countdownEl) countdownEl.textContent = `(${secondsLeft}s)`;
              if (progressBarEl) {
                const percent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
                progressBarEl.style.width = `${percent}%`;
                const progressWrap = msgElem.querySelector('.msg-progress');
                if (progressWrap) progressWrap.setAttribute('aria-valuenow', percent);
              }
              if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
              }
            }, 1000);

            redirectTimer = setTimeout(() => {
              clearTimers();
              if (options.onProceed) options.onProceed();
            }, options.redirectDelay);
          }

          // auto-dismiss unless explicitly disabled
          if (options.autoDismiss !== false) {
            dismissTimer = setTimeout(() => {
              const el = form.querySelector('.form-message');
              if (el) el.remove();
            }, options.dismissAfter || 3000);
          }
        }, 10);
      }

      function handleFormSuccess() {
        showFormMessage('\u2705 Message sent successfully! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'thankyou.html';
        }, 10000);
      }

      // Immediate feedback: show 'Sending...' with spinner
      showFormMessage('Sending...', 'info', { autoDismiss: false });

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Read optional data-attributes from the form for configurable timers
          const redirectDelay = parseInt(form.getAttribute('data-redirect-delay')) || 9000; // ms
          const dismissAfter = parseInt(form.getAttribute('data-message-dismiss')) || 9000;

          // Show success and set up optional redirect: redirect only if success AND (timeout elapsed OR user consents)
          const msgOptions = {
            showProceed: true,
            //countdownStart: Math.ceil(redirectDelay / 1000),
            redirectDelay: redirectDelay,
            onProceed: () => {
              clearTimers();
              window.location.href = 'thankyou.html';
            },
            autoDismiss: true,
            dismissAfter: dismissAfter,
            stayDismissAfter: 3000,
          };

          showFormMessage('\u2705 Message sent successfully! Redirecting...', 'success', msgOptions);

          this.reset();
        } else {
          // Non-OK response from server — show inline error then auto-dismiss
          showFormMessage('\u26A0\uFE0F Submission failed. Please try again later.', 'error', { autoDismiss: true, dismissAfter: 9000 });
        }
      } catch (error) {
        // Show inline network error instead of alert
        showFormMessage('\u274C Network error. Please check your connection.', 'error', { autoDismiss: true, dismissAfter: 9000 });
      }
    });
  }
});





