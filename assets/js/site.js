// Peakline's website: English or Traditional Chinese, as the visitor's
// browser prefers or as they choose (kept in this browser only), and the
// sections fading in as the page scrolls.

(function () {
  var root = document.documentElement;
  root.classList.add("js");

  function stored() {
    try { return localStorage.getItem("peakline-lang"); } catch (e) { return null; }
  }

  function store(lang) {
    try { localStorage.setItem("peakline-lang", lang); } catch (e) { /* private mode */ }
  }

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-Hant-HK" : "en");
    var title = document.querySelector("meta[name='title-" + lang + "']");
    if (title) document.title = title.getAttribute("content");
  }

  var preferred = stored() ||
    ((navigator.language || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en");
  apply(preferred);

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".lang");
    if (button) {
      button.addEventListener("click", function () {
        var next = root.getAttribute("data-lang") === "zh" ? "en" : "zh";
        apply(next);
        store(next);
      });
    }

    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("shown"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  });
})();
