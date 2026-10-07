// The journey: a flight over Hong Kong from the harbour at dusk, along
// Lion Rock and into the night, drawn by Peakline's own engine frame by
// frame and played by the page's scroll. Each chapter holds on its frame
// while its words show; between them, the frames run.
//
// The frames are a video, landscape for wide screens and portrait for
// phones, read whole into memory and sought frame by frame onto a canvas.
// Until it has arrived, each chapter's own frame stands in. The flight
// follows the scroll eased, so a wheel's steps glide.

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

  var FPS = 30;
  // Each chapter's frame, and the minutes after 17:00 there (tools/journey.py).
  var KEYS = [0, 90, 180, 270, 360, 450];
  var MINUTES = [30, 38, 46, 54, 240, 255];
  // How a run speeds up and slows down (tools/journey.py's RAMP).
  var RAMP = 0.25;
  // Units of scroll: a hold at each chapter, then its frames to the next.
  var HOLD = 1.0;
  var RUN = 1.7;
  var TOTAL = KEYS.length * HOLD + (KEYS.length - 1) * RUN;
  // How quickly the flight catches up with the scroll, seconds.
  var LAG = 0.11;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // As the page's CSS picks the first frame: (max-aspect-ratio: 85/100).
  function shape() { return window.innerWidth / window.innerHeight <= 0.85 ? "port" : "land"; }
  var set = shape();
  var generation = 0;
  var stills = [];        // each chapter's frame, while the video comes
  var video = null;       // ready to seek
  var shown = "";         // what is on the canvas: "v" and a frame, or "c" and a chapter
  var still = false;      // whether a chapter's own frame is wanted
  var sought = -1;        // the frame being sought
  var soughtAt = 0;       // when, in case the video never answers
  var checked = false;    // whether the video's first frame was looked at
  var target = 0;         // where the scroll is, in units
  var eased = 0;          // where the flight is, in units
  var last = 0;

  function ease(s) {
    var top = 1 / (1 - RAMP);
    if (s < RAMP) return top * s * s / (2 * RAMP);
    if (s > 1 - RAMP) return 1 - ease(1 - s);
    return top * (s - RAMP / 2);
  }

  // The scroll's share of the section, in units.
  function scrolled() {
    var rect = section.getBoundingClientRect();
    var travel = section.offsetHeight - window.innerHeight;
    return Math.min(Math.max(-rect.top / Math.max(travel, 1), 0), 1) * TOTAL;
  }

  // What a place in units shows: the frame, which chapter's words, whether
  // it is between chapters.
  function at(unit) {
    for (var i = 0; i < KEYS.length; i++) {
      if (unit <= HOLD || i === KEYS.length - 1) return { frame: KEYS[i], chapter: i, moving: false };
      unit -= HOLD;
      if (unit <= RUN) {
        var s = unit / RUN;
        if (reduce.matches) s = s < 0.5 ? 0 : 1;
        return { frame: KEYS[i] + (KEYS[i + 1] - KEYS[i]) * s, chapter: s < 0.5 ? i : i + 1, moving: s > 0 && s < 1 };
      }
      unit -= RUN;
    }
    return { frame: KEYS[KEYS.length - 1], chapter: KEYS.length - 1, moving: false };
  }

  function minutesAt(frame) {
    for (var i = 0; i < KEYS.length - 1; i++) {
      if (frame <= KEYS[i + 1]) {
        var e = ease((frame - KEYS[i]) / (KEYS[i + 1] - KEYS[i]));
        return MINUTES[i] + (MINUTES[i + 1] - MINUTES[i]) * e;
      }
    }
    return MINUTES[MINUTES.length - 1];
  }

  function size() {
    var ratio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    context.imageSmoothingQuality = "high";
    shown = "";
  }

  // A picture over the canvas, covering it as `object-fit: cover` would.
  function paint(picture, width, height) {
    var scale = Math.max(canvas.width / width, canvas.height / height);
    var w = width * scale;
    var h = height * scale;
    context.drawImage(picture, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }

  // What the flight shows: held at a chapter, its own frame, sharper than
  // the video's; between chapters, the frame sought in the video, or the
  // nearest chapter's frame until the video is ready. Whether the canvas
  // has it.
  function show(place, now) {
    var frame = Math.round(place.frame);
    still = !place.moving && !!stills[place.chapter];
    if (video && !still) {
      if (sought >= 0 && now - soughtAt > 600) sought = -1;
      if (sought >= 0) return false;
      if (shown === "v" + frame) return true;
      sought = frame;
      soughtAt = now;
      video.currentTime = (frame + 0.5) / FPS;
      return false;
    }
    var best = -1;
    if (still) best = place.chapter;
    else {
      for (var i = 0; i < KEYS.length; i++) {
        if (stills[i] && (best < 0 || Math.abs(KEYS[i] - frame) < Math.abs(KEYS[best] - frame))) best = i;
      }
    }
    if (best >= 0 && shown !== "c" + best) {
      paint(stills[best], stills[best].naturalWidth, stills[best].naturalHeight);
      shown = "c" + best;
    }
    return true;
  }

  function onSought() {
    if (!video) return;
    if (still) { sought = -1; return; }
    paint(video, video.videoWidth, video.videoHeight);
    if (!checked) {
      checked = true;
      // Where a phone will not play it (Low Power Mode), a sought frame
      // can come out black: then the chapters' frames stay.
      var middle = context.getImageData(canvas.width >> 1, canvas.height >> 1, 4, 4).data;
      var brightest = 0;
      for (var i = 0; i < middle.length; i += 4) brightest = Math.max(brightest, middle[i], middle[i + 1], middle[i + 2]);
      if (brightest < 4) { video = null; sought = -1; shown = ""; request(); return; }
    }
    shown = "v" + sought;
    sought = -1;
    request();
  }

  // Each chapter's frame first, then the video, read whole so that seeking
  // never waits on the network.
  function load() {
    var mine = ++generation;
    var base = "assets/journey/" + set;
    stills = [];
    video = null;
    checked = false;
    shown = "";
    sought = -1;
    if (bar) { bar.style.width = "0"; bar.parentNode.classList.remove("done"); }
    KEYS.forEach(function (key, i) {
      var image = new Image();
      image.onload = function () { if (mine === generation) { stills[i] = image; shown = ""; request(); } };
      image.src = base + "/c" + i + ".webp";
    });
    if (!window.fetch || !window.URL || !URL.createObjectURL) return;
    fetch(base + ".mp4").then(function (response) {
      if (!response.ok) throw new Error(response.status);
      var length = Number(response.headers.get("Content-Length")) || 0;
      if (!response.body || !length) return response.blob();
      var reader = response.body.getReader();
      var parts = [];
      var received = 0;
      function pump() {
        return reader.read().then(function (step) {
          if (step.done) return new Blob(parts, { type: "video/mp4" });
          parts.push(step.value);
          received += step.value.length;
          if (bar && mine === generation) bar.style.width = Math.round((received / length) * 100) + "%";
          return pump();
        });
      }
      return pump();
    }).then(function (blob) {
      if (mine !== generation) return;
      var element = document.createElement("video");
      element.muted = true;
      element.defaultMuted = true;
      element.playsInline = true;
      element.setAttribute("playsinline", "");
      element.setAttribute("muted", "");
      element.preload = "auto";
      element.className = "frames";
      element.addEventListener("seeked", onSought);
      element.addEventListener("loadeddata", function () {
        // iOS shows a sought frame only once the video has played.
        var started = element.play();
        var ready = function () {
          element.pause();
          if (mine !== generation) return;
          video = element;
          shown = "";
          if (bar) { bar.style.width = "100%"; bar.parentNode.classList.add("done"); }
          request();
        };
        if (started && started.then) started.then(ready, ready); else ready();
      }, { once: true });
      element.src = URL.createObjectURL(blob);
      section.querySelector(".stage").appendChild(element);
    }).catch(function () { /* the chapters' frames stay */ });
  }

  var ticking = false;
  function frame(now) {
    ticking = false;
    var dt = last ? Math.min((now - last) / 1000, 0.1) : 0.016;
    last = now;
    target = scrolled();
    var step = reduce.matches ? 1 : 1 - Math.exp(-dt / LAG);
    eased += (target - eased) * step;
    if (Math.abs(target - eased) < 0.0005) eased = target;
    var place = at(eased);
    var done = show(place, now);
    panels.forEach(function (panel, i) { panel.classList.toggle("on", i === place.chapter && !place.moving); });
    dots.forEach(function (dot, i) { dot.classList.toggle("on", i === place.chapter); });
    if (clock) {
      var minutes = Math.round(minutesAt(place.frame));
      clock.textContent = (17 + Math.floor(minutes / 60)) + ":" + String(minutes % 60).padStart(2, "0");
    }
    if (hint) hint.classList.toggle("gone", target > 0.02);
    if (eased !== target || !done) request();
    else last = 0;
  }

  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  }

  // A dot's chapter: scrolled to its hold.
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      var unit = i * (HOLD + RUN) + HOLD / 2;
      var travel = section.offsetHeight - window.innerHeight;
      var top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (unit / TOTAL) * travel, behavior: reduce.matches ? "auto" : "smooth" });
    });
  });

  window.addEventListener("scroll", request, { passive: true });
  // Turned between landscape and portrait: the other video.
  window.addEventListener("resize", function () {
    size();
    if (shape() !== set) {
      set = shape();
      var old = section.querySelector("video.frames");
      if (old) { URL.revokeObjectURL(old.src); old.remove(); }
      load();
    }
    request();
  });
  size();
  eased = target = scrolled();
  load();
  request();
})();
