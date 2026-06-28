/* =========================================================
   PromptForge — accordion.js
   Collapsible accordion sections. Compact collapsed state,
   expanded shows controls. Sections are INDEPENDENT — opening
   one does NOT close another.

   Overflow strategy:
   - Closed: max-height:0 + overflow:hidden → fully hidden, no reserved space.
   - During expand/collapse animation: overflow:hidden (set by CSS).
   - After expand animation completes: JS adds .is-settled which switches
     overflow to visible — lets combobox dropdowns escape the accordion body.
   - When starting to collapse: JS removes .is-settled first.
   ========================================================= */
(function (global) {
  "use strict";

  var SETTLE_DELAY = 300; // matches CSS transition duration

  function init(scope) {
    scope = scope || document;
    var accordions = Array.prototype.slice.call(scope.querySelectorAll(".accordion"));

    accordions.forEach(function (acc) {
      var head = acc.querySelector(".accordion__head");
      if (!head) return;
      if (head.getAttribute("aria-expanded") === "true") {
        acc.classList.add("is-open", "is-settled");
      }

      head.addEventListener("click", function () {
        var wasOpen = acc.classList.contains("is-open");
        if (wasOpen) {
          // Start collapsing: remove settled first so overflow becomes hidden again
          acc.classList.remove("is-settled");
          // Allow one frame so the browser applies overflow:hidden before max-height transitions
          requestAnimationFrame(function () {
            acc.classList.remove("is-open");
            head.setAttribute("aria-expanded", "false");
          });
        } else {
          // Expanding: open immediately, add settled after animation completes
          acc.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
          // Clear any pending settle timer
          if (acc._settleTimer) {
            clearTimeout(acc._settleTimer);
          }
          acc._settleTimer = setTimeout(function () {
            acc.classList.add("is-settled");
            acc._settleTimer = null;
          }, SETTLE_DELAY);
          scrollIntoPanel(acc);
        }
      });

      head.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          head.click();
        }
      });
    });

    function scrollIntoPanel(acc) {
      var parent = acc.parentElement;
      while (parent && !parent.classList.contains("panel__body")) {
        parent = parent.parentElement;
      }
      if (!parent) return;
      var accRect = acc.getBoundingClientRect();
      var parentRect = parent.getBoundingClientRect();
      if (accRect.top < parentRect.top + 8 || accRect.bottom > parentRect.bottom - 8) {
        parent.scrollTo({
          top: parent.scrollTop + (accRect.top - parentRect.top) - 12,
          behavior: "smooth"
        });
      }
    }
  }

  function open(acc) {
    if (typeof acc === "string") acc = document.querySelector('[data-section="' + acc + '"]');
    if (!acc) return;
    var head = acc.querySelector(".accordion__head");
    if (!acc.classList.contains("is-open")) head.click();
  }

  function close(acc) {
    if (typeof acc === "string") acc = document.querySelector('[data-section="' + acc + '"]');
    if (!acc) return;
    var head = acc.querySelector(".accordion__head");
    if (acc.classList.contains("is-open")) head.click();
  }

  global.PF = global.PF || {};
  global.PF.Accordion = { init: init, open: open, close: close };

})(typeof window !== "undefined" ? window : this);
