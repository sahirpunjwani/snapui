/*!
 * WireUI v1.0.1
 * Zero-config UI library — add a class, get style + behavior.
 * MIT License
 */

(function (global) {
  'use strict';

  const WireUI = {

    init() {
      this._initPassword();
      this._initSearch();
      this._initOTP();
      this._initTextarea();
      this._initRange();
      this._initFile();
      this._initRating();
      this._initCounter();
      this._initModal();
      this._initDarkMode();
      this._initValidation();
      this._initForms();
      this._initToastContainer();
      console.log('%c⚡ WireUI initialized', 'color:#7c6cfc;font-weight:bold;font-size:13px;');
    },

    _initPassword() {
      document.querySelectorAll('.ui-password').forEach(input => {
        if (input.parentElement.classList.contains('ui-input-wrap')) return; // already done
        const wrap = document.createElement('div');
        wrap.className = 'ui-input-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        input.type = 'password';
        if (!input.placeholder) input.placeholder = 'Enter password...';

        const icon = document.createElement('span');
        icon.className = 'ui-input-icon';
        icon.innerHTML = '👁';
        icon.title = 'Show/Hide password';
        icon.addEventListener('click', () => {
          const show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          icon.innerHTML = show ? '🙈' : '👁';
        });
        wrap.appendChild(icon);
      });
    },

    _initSearch() {
      document.querySelectorAll('.ui-search').forEach(input => {
        if (input.parentElement.classList.contains('ui-search-wrap')) return;

        // look for submit button as next sibling or within same parent
        const submitBtn = this._findSibling(input, '.ui-search-submit');

        const wrap = document.createElement('div');
        wrap.className = 'ui-search-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        if (submitBtn) {
          wrap.appendChild(submitBtn);
          if (!submitBtn.textContent.trim()) submitBtn.textContent = '🔍';
        }

        if (!input.placeholder) input.placeholder = 'Search...';
        input.type = 'search';

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && submitBtn) submitBtn.click();
        });
      });
    },

    _initOTP() {
      document.querySelectorAll('.ui-otp').forEach(input => {
        if (input.parentElement.classList.contains('ui-otp-wrap')) return;
        const length = parseInt(input.dataset.length || 6);

        const wrap = document.createElement('div');
        wrap.className = 'ui-otp-wrap';
        input.parentNode.insertBefore(wrap, input);
        input.style.display = 'none';
        wrap.appendChild(input);

        const boxes = [];
        for (let i = 0; i < length; i++) {
          const box = document.createElement('input');
          box.type = 'text';
          box.maxLength = 1;
          box.className = 'ui-otp-box';
          box.inputMode = 'numeric';
          box.autocomplete = 'off';
          wrap.appendChild(box);
          boxes.push(box);

          box.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            box.value = val;
            if (val && i < length - 1) boxes[i + 1].focus();
            input.value = boxes.map(b => b.value).join('');
          });

          box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && i > 0) {
              boxes[i - 1].focus();
              boxes[i - 1].value = '';
              input.value = boxes.map(b => b.value).join('');
            }
          });

          box.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
            pasted.split('').forEach((ch, idx) => { if (boxes[idx]) boxes[idx].value = ch; });
            input.value = boxes.map(b => b.value).join('');
            const next = boxes.find(b => !b.value);
            (next || boxes[length - 1]).focus();
          });
        }
      });
    },

    _initTextarea() {
      document.querySelectorAll('.ui-textarea').forEach(ta => {
        const max = parseInt(ta.dataset.max || 0);
        if (!max) return;
        ta.maxLength = max;

        // avoid double-adding
        if (ta.nextElementSibling && ta.nextElementSibling.classList.contains('ui-char-count')) return;

        const counter = document.createElement('div');
        counter.className = 'ui-char-count';
        counter.textContent = `0 / ${max}`;
        ta.parentNode.insertBefore(counter, ta.nextSibling);

        ta.addEventListener('input', () => {
          const len = ta.value.length;
          counter.textContent = `${len} / ${max}`;
          counter.className = 'ui-char-count';
          if (len >= max)             counter.classList.add('at-limit');
          else if (len >= max * 0.8)  counter.classList.add('near-limit');
        });
      });
    },

    _initRange() {
      document.querySelectorAll('.ui-range').forEach(range => {
        if (range.dataset.wired) return;
        range.dataset.wired = '1';

        const prefix = range.dataset.prefix || '';
        const suffix = range.dataset.suffix || '';

        const val = document.createElement('div');
        val.className = 'ui-range-val';
        val.textContent = `${prefix}${range.value}${suffix}`;
        range.parentNode.insertBefore(val, range.nextSibling);

        const update = () => {
          val.textContent = `${prefix}${range.value}${suffix}`;
          const pct = ((range.value - range.min) / ((range.max - range.min) || 1)) * 100;
          range.style.background = `linear-gradient(to right, var(--ui-accent) ${pct}%, var(--ui-border) ${pct}%)`;
        };

        range.addEventListener('input', update);
        update(); // run on init
      });
    },

    _initFile() {
      document.querySelectorAll('input[type="file"].ui-file').forEach(input => {
        if (input.parentElement.classList.contains('ui-file-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ui-file-wrap';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const label = document.createElement('div');
        label.className = 'ui-file-label';
        label.innerHTML = '📁 <strong>Click to upload</strong> or drag & drop';
        wrap.appendChild(label);

        const preview = document.createElement('div');
        preview.className = 'ui-file-preview';
        wrap.appendChild(preview);

        wrap.addEventListener('dragover', (e) => { e.preventDefault(); wrap.classList.add('dragover'); });
        wrap.addEventListener('dragleave', () => wrap.classList.remove('dragover'));
        wrap.addEventListener('drop', (e) => {
          e.preventDefault();
          wrap.classList.remove('dragover');
          // can't assign dataTransfer.files directly to input.files in all browsers
          // just show preview
          updatePreview(e.dataTransfer.files);
        });

        input.addEventListener('change', () => updatePreview(input.files));

        function updatePreview(files) {
          if (!files || !files.length) return;
          const names = Array.from(files).map(f => `${f.name} (${(f.size/1024).toFixed(1)}KB)`).join(', ');
          preview.textContent = `✅ ${names}`;
          label.innerHTML = '📁 <strong>Change file</strong>';
        }
      });
    },

    _initRating() {
      document.querySelectorAll('.ui-rating').forEach(input => {
        if (input.parentElement.classList.contains('ui-rating-wrap')) return;
        const max = parseInt(input.dataset.max || 5);

        const wrap = document.createElement('div');
        wrap.className = 'ui-rating-wrap';
        input.style.display = 'none';
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);

        const stars = [];
        for (let i = 1; i <= max; i++) {
          const star = document.createElement('span');
          star.className = 'ui-star';
          star.textContent = '★';
          star.dataset.val = i;
          wrap.appendChild(star);
          stars.push(star);

          star.addEventListener('click', () => {
            input.value = i;
            stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= i));
            input.dispatchEvent(new Event('change'));
          });

          star.addEventListener('mouseover', () => {
            stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= i));
          });
        }

        wrap.addEventListener('mouseleave', () => {
          const v = parseInt(input.value || 0);
          stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= v));
        });
      });
    },

    _initCounter() {
      document.querySelectorAll('.ui-counter').forEach(input => {
        if (input.parentElement.classList.contains('ui-counter-wrap')) return;

        const min  = parseFloat(input.dataset.min ?? 0);
        const max  = parseFloat(input.dataset.max ?? 9999);
        const step = parseFloat(input.dataset.step ?? 1);
        if (!input.value) input.value = min;

        const wrap = document.createElement('div');
        wrap.className = 'ui-counter-wrap';
        input.parentNode.insertBefore(wrap, input);

        const dec = document.createElement('button');
        dec.type = 'button';
        dec.className = 'ui-counter-dec';
        dec.textContent = '−';

        const inc = document.createElement('button');
        inc.type = 'button';
        inc.className = 'ui-counter-inc';
        inc.textContent = '+';

        wrap.appendChild(dec);
        wrap.appendChild(input);
        wrap.appendChild(inc);

        dec.addEventListener('click', () => {
          const v = parseFloat(input.value) - step;
          if (v >= min) { input.value = v; input.dispatchEvent(new Event('change')); }
        });
        inc.addEventListener('click', () => {
          const v = parseFloat(input.value) + step;
          if (v <= max) { input.value = v; input.dispatchEvent(new Event('change')); }
        });
      });
    },

    _initModal() {
      document.querySelectorAll('[class*="ui-modal-open"]').forEach(btn => {
        const target = btn.dataset.target;
        if (!target) return;
        const backdrop = document.querySelector(target);
        if (!backdrop) return;

        btn.addEventListener('click', () => backdrop.classList.add('open'));

        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) backdrop.classList.remove('open');
        });

        backdrop.querySelectorAll('.ui-modal-close').forEach(closeBtn => {
          closeBtn.addEventListener('click', () => backdrop.classList.remove('open'));
        });
      });

      // Global ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.ui-modal-backdrop.open').forEach(m => m.classList.remove('open'));
        }
      });
    },

    _initDarkMode() {
      document.querySelectorAll('.ui-darkmode-toggle').forEach(toggle => {
        const saved = localStorage.getItem('ui-theme');
        if (saved) {
          document.documentElement.setAttribute('data-theme', saved);
          toggle.checked = saved === 'light';
        }
        toggle.addEventListener('change', () => {
          const theme = toggle.checked ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('ui-theme', theme);
        });
      });
    },

    _initValidation() {
      document.querySelectorAll('.ui-email').forEach(input => {
        if (!input.placeholder) input.placeholder = 'Enter email address...';
        input.type = 'email';
        input.addEventListener('blur', () => {
          if (!input.value) return this._clearValidity(input);
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
          this._setValidity(input, ok, 'Enter a valid email address');
        });
        input.addEventListener('input', () => {
          if (input.classList.contains('invalid') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            this._setValidity(input, true, '');
          }
        });
      });

      document.querySelectorAll('.ui-phone').forEach(input => {
        if (!input.placeholder) input.placeholder = '+1 (555) 000-0000';
        input.type = 'tel';
        input.addEventListener('input', () => {
          input.value = input.value.replace(/[^\d\s\+\-\(\)]/g, '');
        });
      });

      document.querySelectorAll('.ui-url').forEach(input => {
        if (!input.placeholder) input.placeholder = 'https://...';
        input.type = 'url';
        input.addEventListener('blur', () => {
          if (!input.value) return;
          const ok = /^https?:\/\/.+/.test(input.value);
          this._setValidity(input, ok, 'Enter a valid URL starting with https://');
        });
      });

      document.querySelectorAll('.ui-number').forEach(input => {
        input.type = 'number';
        if (!input.placeholder) input.placeholder = '0';
      });

      document.querySelectorAll('.ui-text').forEach(input => {
        if (!input.type || input.type === 'text') input.type = 'text';
      });
    },

    _setValidity(input, valid, errorMsg) {
      input.classList.toggle('valid', valid);
      input.classList.toggle('invalid', !valid);
      let err = input.parentElement.querySelector('.ui-error');
      if (!valid && errorMsg) {
        if (!err) {
          err = document.createElement('span');
          err.className = 'ui-error';
          input.parentElement.appendChild(err);
        }
        err.textContent = errorMsg;
        err.classList.add('visible');
      } else if (err) {
        err.classList.remove('visible');
      }
    },

    _clearValidity(input) {
      input.classList.remove('valid', 'invalid');
      const err = input.parentElement.querySelector('.ui-error');
      if (err) err.classList.remove('visible');
    },

    _initForms() {
      document.querySelectorAll('form').forEach(form => {
        const submitBtn = form.querySelector('.ui-submit');
        const resetBtn  = form.querySelector('.ui-reset');

        if (submitBtn) {
          form.addEventListener('submit', (e) => {
            let valid = true;

            // check required fields
            form.querySelectorAll('[required]').forEach(el => {
              if (!el.value.trim()) {
                el.classList.add('invalid');
                valid = false;
              }
            });

            // check emails
            form.querySelectorAll('.ui-email').forEach(input => {
              if (input.value) {
                const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                this._setValidity(input, ok, 'Enter a valid email address');
                if (!ok) valid = false;
              }
            });

            if (!valid) {
              e.preventDefault();
              WireUI.toast('Please fix the errors before submitting.', 'error');
              return;
            }

            // demo: if no real action, show loading then success
            if (!form.getAttribute('action')) {
              e.preventDefault();
              submitBtn.classList.add('loading');
              setTimeout(() => {
                submitBtn.classList.remove('loading');
                WireUI.toast('Form submitted successfully! ✅', 'success');
              }, 1200);
            }
          });
        }

        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            form.reset();
            form.querySelectorAll('input, textarea').forEach(el => this._clearValidity(el));
          });
        }
      });
    },

    _initToastContainer() {
      if (!document.querySelector('.ui-toast-container')) {
        const c = document.createElement('div');
        c.className = 'ui-toast-container';
        document.body.appendChild(c);
      }
    },

    // ── Public API ───────────────────────────────────────────

    toast(message, type = 'info', duration = 3500) {
      const container = document.querySelector('.ui-toast-container');
      if (!container) return;
      const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      const toast = document.createElement('div');
      toast.className = `ui-toast ${type}`;
      toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, duration);
    },

    openModal(selector) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (el) el.classList.add('open');
    },

    closeModal(selector) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (el) el.classList.remove('open');
    },

    setProgress(selector, value) {
      const el = document.querySelector(selector);
      if (!el) return;
      const bar = el.querySelector('.ui-progress-bar');
      if (bar) bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
    },

    _findSibling(el, selector) {
      let sib = el.nextElementSibling;
      while (sib) {
        if (sib.matches(selector)) return sib;
        sib = sib.nextElementSibling;
      }
      return el.parentElement ? el.parentElement.querySelector(selector) : null;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WireUI.init());
  } else {
    WireUI.init();
  }

  global.WireUI = WireUI;

})(window);