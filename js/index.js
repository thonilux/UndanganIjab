// js/index.js
(() => {
  "use strict";

  // Helper singkat
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", () => {
    // === 1. Loader ===
    const loader = $(".loader");
    if (loader) {
      // Pakai event "load" biar nunggu gambar dll selesai
      window.addEventListener("load", () => {
        loader.style.opacity = "0";
        // di index.html sudah ada transition: opacity .3s ease-in;
        setTimeout(() => {
          loader.style.display = "none";
        }, 300);
      });
    }

    // === 2. Nama tamu dari URL (?to= / ?nama= / ?guest=) ===
    try {
      const params = new URLSearchParams(window.location.search);
      const rawName =
        params.get("to") || params.get("nama") || params.get("guest");

      if (rawName) {
        // Kalau DOMPurify ada (sudah di-load di index.html), pakai untuk sanitize
        const safeName =
          typeof window.DOMPurify !== "undefined"
            ? window.DOMPurify.sanitize(rawName)
            : rawName;

        $$(".nama_tamu").forEach((el) => {
          el.textContent = safeName;
        });
      }
    } catch (err) {
      console.warn("Gagal parsing nama tamu:", err);
    }

    // === 3. Tombol "Buka Undangan" ===
    const btnBuka = $("#btn_buka_undangan");
    const cover = $("#coverx");
    const home = $("#home");

    if (btnBuka) {
      btnBuka.addEventListener("click", (ev) => {
        ev.preventDefault();

        // Sembunyikan cover
        if (cover) {
          cover.style.display = "none";
        }

        // Scroll halus ke section home
        if (home) {
          home.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Kalau script audio punya fungsi global playAudio(), panggil
        if (typeof window.playAudio === "function") {
          window.playAudio();
        }
      });
    }

    // === 4. Bottom navigation (Home, Couple, Event, Gallery, Gift, Wishes) ===
    const scrollMap = {
      "btn-home": "#home",
      "btn-couple": "#couple",
      "btn-event": "#event",
      "btn-gallery": "#gallery",
      "btn-gift": "#gift",
      "btn-wishes": "#wishes",
    };

    Object.entries(scrollMap).forEach(([btnId, targetSel]) => {
      const btn = document.getElementById(btnId);
      const target = $(targetSel);

      if (!btn || !target) return;

      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // === 5. Animasi masuk konten (kelas .azoom, .fup, .fdown, .auto) ===
    const animatedEls = $$(".azoom, .fup, .fdown, .auto");

    if (animatedEls.length) {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );

        animatedEls.forEach((el) => observer.observe(el));
      } else {
        // Fallback browser lama: langsung tampilkan
        animatedEls.forEach((el) => el.classList.add("is-visible"));
      }
    }
  });
})();
