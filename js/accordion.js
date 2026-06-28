/* =========================================================
   PromptForge — accordion.js
   Collapsible accordion sections. Compact collapsed state,
   expanded shows controls. Only one large section at a time.
   ========================================================= */
(function (global) {
  "use strict";

  function init(scope) {
    scope = scope || document;
    const accordions = Array.from(scope.querySelectorAll(".accordion"));

    accordions.forEach(function (acc) {
      const head = acc.querySelector(".accordion__head");
      if (!head) return;

      // Default the first accordion to open
      // (handled by HTML's aria-expanded, but ensure visual sync)
      if (head.getAttribute("aria-expanded") === "true") {
        acc.classList.add("is-open");
      }

      head.addEventListener("click", function () {
        const wasOpen = acc.classList.contains("is-open");

        // Single-open-at-a-time: close siblings within same panel
        const panel = acc.closest(".panel__body");
        if (panel) {
          panel.querySelectorAll(".accordion.is-open").forEach(function (other) {
            if (other !== acc) {
              other.classList.remove("is-open");
              const h = other.querySelector(".accordion__head");
              if (h) h.setAttribute("aria-expanded", "false");
            }
          });
        }

        if (wasOpen) {
          acc.classList.remove("is-open");
          head.setAttribute("aria-expanded", "false");
        } else {
          acc.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
          // Scroll the just-opened accordion into view inside its panel
          scrollIntoPanel(acc);
        }
      });

      // Keyboard support
      head.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          head.click();
        }
      });
    });

    function scrollIntoPanel(acc) {
      // Find the scrollable parent (.panel__body)
      let parent = acc.parentElement;
      while (parent && !parent.classList.contains("panel__body")) {
        parent = parent.parentElement;
      }
      if (!parent) return;
      const accRect = acc.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      // If accordion head is not visible, scroll it into view (top alignment)
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
    const head = acc.querySelector(".accordion__head");
    if (!acc.classList.contains("is-open")) head.click();
  }

  function close(acc) {
    if (typeof acc === "string") acc = document.querySelector('[data-section="' + acc + '"]');
    if (!acc) return;
    const head = acc.querySelector(".accordion__head");
    if (acc.classList.contains("is-open")) head.click();
  }

  global.PF = global.PF || {};
  global.PF.Accordion = { init: init, open: open, close: close };

})(typeof window !== "undefined" ? window : this);
