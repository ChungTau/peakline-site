# Peakline website

The website of [Peakline](https://chungtau.github.io/peakline-site/), a 3D map
of Hong Kong for iPhone: the landing page, the privacy policy and the terms
of service, in English and Traditional Chinese.

- Plain static HTML and CSS, no build step, served by GitHub Pages from
  `main`. `.nojekyll` keeps Pages from running Jekyll over it.
- `index.html` — the landing page; `privacy/` and `terms/` — the legal pages;
  `404.html`.
- `assets/js/site.js` — the language switch (the browser's language first,
  then the visitor's choice, kept in their browser) and the sections fading
  in as the page scrolls. Without it, the page is whole in English.
- The landing page opens with a journey played by the scroll, after
  [asklex.law/journey](https://asklex.law/journey/): a flight from Victoria
  Harbour at 17:30, up Nathan Road to Lion Rock and the MacLehose Trail, down
  into Yau Ma Tei at 21:00 and up to the trail under the stars. Each of its
  151 frames is a still from Peakline's own engine (`hk3d-viewer`), in a
  landscape set (`assets/journey/land/`, 1600×900) and a portrait one for
  phones (`assets/journey/port/`, 810×1440). `tools/journey.py` prints the
  command for every frame. `assets/js/journey.js` pins the stage, draws the
  frame for the scroll on a canvas, holds each chapter while its words show,
  and loads a few frames across the flight first, then the rest. With
  reduced motion it steps from chapter to chapter; without script, the first
  chapter shows over the first frame.
- `assets/img/` — the app's icon at three sizes, the share image, and three
  screenshots from the iOS simulator.

The URLs App Store Connect asks for:

| Field | URL |
|---|---|
| Marketing URL | https://chungtau.github.io/peakline-site/ |
| Support URL | https://chungtau.github.io/peakline-site/#support |
| Privacy Policy URL | https://chungtau.github.io/peakline-site/privacy/ |

To look at it locally: `python3 -m http.server` here, then
http://localhost:8000/.
