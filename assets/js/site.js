// Peakline's website: English or Traditional Chinese, as the visitor's
// browser prefers or as they choose (kept in this browser only).

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

  });
})();
