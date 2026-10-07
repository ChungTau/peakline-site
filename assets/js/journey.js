// The journey: a flight over Hong Kong from the harbour at dusk, along
// Lion Rock and into the night, drawn by Peakline's own engine frame by
// frame and played by the page's scroll. Each chapter holds on its frame
// while its words show; between them, the frames run.
//
// The frames are a landscape set for wide screens and a portrait one for
// phones; the nearest loaded frame is drawn while the rest arrive, a few
// at first across the whole flight, then every one.

(function () {
  var section = document.querySelector(".journey");
  if (!section) return;
  var canvas = section.querySelector("canvas");
  var context = canvas.getContext("2d");
  var panels = Array.prototype.slice.call(section.querySelectorAll(".chapter"));
  var dots = Array.prototype.slice.call(section.querySelectorAll(".dots button"));
  var clock = section.querySelector(".clock b");
  var bar = section.querySelector(".loading i");
  var hint = section.querySelector(".hint");

  var COUNT = 151;
  // Each chapter's frame, and the minutes after 17:00 there (journey's path.py).
  var KEYS = [0, 30, 60, 90, 126, 150];
  var MINUTES = [30, 38, 46, 54, 240, 255];
  // Units of scroll: a hold at each chapter, then its frames to the next.
  var HOLD = 1.0;
  var RUN = 1.7;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // As the page's CSS picks the first frame: (max-aspect-ratio: 85/100).
  function shape() { return window.innerWidth / window.innerHeight <= 0.85 ? "port" : "land"; }
  var set = shape();
  var frames = new Array(COUNT);
  var loaded = 0;
  var current = -1;
  var wanted = 0;
  var generation = 0;

  function source(index) {
    return "assets/journey/" + set + "/f" + String(index).padStart(3, "0") + ".webp";
  }

  // A few across the flight first, the chapters among them, then the rest.
  function order() {
    var seen = {};
    var list = [];
    function add(i) { if (!seen[i] && i >= 0 && i < COUNT) { seen[i] = true; list.push(i); } }
    KEYS.forEach(add);
    [16, 8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < COUNT; i += step) add(i); });
    return list;
  }

  function load() {
    var queue = order();
    var busy = 0;
    var mine = generation;
    function next() {
      while (busy < 6 && queue.length) {
        var index = queue.shift();
        busy += 1;
        var image = new Image();
        image.decoding = "async";
        image.onload = image.onerror = (function (i, img) {
          return function () {
            if (mine !== generation) return;
            busy -= 1;
            if (img.naturalWidth) { frames[i] = img; loaded += 1; }
            if (bar) bar.style.width = Math.round((loaded / COUNT) * 100) + "%";
            if (loaded === COUNT && bar) bar.parentNode.classList.add("done");
            if (Math.abs(i - wanted) < 3 || current < 0) draw(true);
            next();
          };
        })(index, image);
        image.src = source(index);
      }
    }
    next();
  }

  // The loaded frame nearest `index`.
  function nearest(index) {
    for (var d = 0; d < COUNT; d++) {
      if (frames[index - d]) return index - d;
      if (frames[index + d]) return index + d;
    }
    return -1;
  }

  function size() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    draw(true);
  }

  // The frame over the canvas, covering it as `object-fit: cover` would.
  function draw(force) {
    var index = nearest(wanted);
    if (index < 0 || (index === current && !force)) return;
    current = index;
    var image = frames[index];
    var scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    var w = image.naturalWidth * scale;
    var h = image.naturalHeight * scale;
    context.drawImage(image, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }

  // Where the scroll is in the journey, in units, and what it shows there:
  // the frame, which chapter's words, and the time.
  function place() {
    var rect = section.getBoundingClientRect();
    var travel = section.offsetHeight - window.innerHeight;
    var share = Math.min(Math.max(-rect.top / Math.max(travel, 1), 0), 1);
    var total = KEYS.length * HOLD + (KEYS.length - 1) * RUN;
    var unit = share * total;
    var chapter = 0;
    var frame = 0;
    var within = 0;
    for (var i = 0; i < KEYS.length; i++) {
      if (unit <= HOLD || i === KEYS.length - 1) { chapter = i; frame = KEYS[i]; within = -1; break; }
      unit -= HOLD;
      if (unit <= RUN) {
        var s = unit / RUN;
        if (reduce.matches) s = s < 0.5 ? 0 : 1;
        frame = KEYS[i] + (KEYS[i + 1] - KEYS[i]) * s;
        chapter = s < 0.5 ? i : i + 1;
        within = s;
        break;
      }
      unit -= RUN;
    }
    return { frame: Math.round(frame), chapter: chapter, moving: within >= 0, share: share };
  }

  function minutesAt(frame) {
    for (var i = 0; i < KEYS.length - 1; i++) {
      if (frame <= KEYS[i + 1]) {
        var s = (frame - KEYS[i]) / (KEYS[i + 1] - KEYS[i]);
        var e = s * s * (3 - 2 * s);
        return MINUTES[i] + (MINUTES[i + 1] - MINUTES[i]) * e;
      }
    }
    return MINUTES[MINUTES.length - 1];
  }

  var ticking = false;
  function update() {
    ticking = false;
    var at = place();
    wanted = at.frame;
    draw(false);
    panels.forEach(function (panel, i) { panel.classList.toggle("on", i === at.chapter && !at.moving); });
    dots.forEach(function (dot, i) { dot.classList.toggle("on", i === at.chapter); });
    if (clock) {
      var minutes = Math.round(minutesAt(at.frame));
      clock.textContent = (17 + Math.floor(minutes / 60)) + ":" + String(minutes % 60).padStart(2, "0");
    }
    if (hint) hint.classList.toggle("gone", at.share > 0.01);
  }

  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  // A dot's chapter: scrolled to its hold.
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      var total = KEYS.length * HOLD + (KEYS.length - 1) * RUN;
      var unit = i * (HOLD + RUN) + HOLD / 2;
      var travel = section.offsetHeight - window.innerHeight;
      var top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (unit / total) * travel, behavior: reduce.matches ? "auto" : "smooth" });
    });
  });

  window.addEventListener("scroll", request, { passive: true });
  // Turned between landscape and portrait: the other set of frames.
  window.addEventListener("resize", function () {
    if (shape() !== set) {
      set = shape();
      generation += 1;
      frames = new Array(COUNT);
      loaded = 0;
      current = -1;
      if (bar) { bar.style.width = "0"; bar.parentNode.classList.remove("done"); }
      load();
    }
    size();
    request();
  });
  size();
  load();
  update();
})();
