// A native video player and explicit chapter choices. Scrolling never changes
// playback. Existing chapter frames are also the paused player's posters.
(function () {
  var section = document.querySelector('.journey');
  if (!section) return;
  var video = section.querySelector('video');
  var play = section.querySelector('.film-play');
  var error = section.querySelector('.film-error');
  var buttons = Array.from(section.querySelectorAll('[data-chapter]'));
  var chapters = Array.from(section.querySelectorAll('[data-scene]'));
  // The existing film's chapter frames, at 30 fps (tools/journey.py).
  var times = [0, 3, 6, 9, 12, 15];
  var pending = null;
  var current = 0;

  function show(index) {
    current = index;
    chapters.forEach(function (chapter, i) { chapter.hidden = i !== index; });
    buttons.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === index)); });
  }

  function seek() {
    if (pending === null || video.readyState < 1) return;
    video.currentTime = Math.min(pending, Math.max(0, video.duration - 0.02));
    pending = null;
  }

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () {
      video.pause();
      show(index);
      video.poster = 'assets/journey/land/c' + index + '.webp';
      pending = times[index];
      if (video.readyState >= 1) seek();
      else video.load();
    });
    button.disabled = false;
  });

  video.addEventListener('loadedmetadata', seek);
  video.addEventListener('timeupdate', function () {
    if (pending !== null) return;
    var index = 0;
    times.forEach(function (time, i) { if (video.currentTime >= time) index = i; });
    if (index !== current) show(index);
  });
  video.addEventListener('play', function () {
    play.classList.add('playing');
    error.hidden = true;
  });
  video.addEventListener('pause', function () { play.classList.remove('playing'); });
  video.addEventListener('ended', function () { play.classList.remove('playing'); });
  video.addEventListener('error', function () { error.hidden = false; });
  play.addEventListener('click', function () {
    if (!video.paused) video.pause();
    else video.play().catch(function () { error.hidden = false; });
  });
  play.hidden = false;
})();
