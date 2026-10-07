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
  451 frames is a still from Peakline's own engine (`hk3d-viewer`), drawn
  larger than shown and scaled down, in a landscape video
  (`assets/journey/land.mp4`, 2560×1440) and a portrait one for phones
  (`port.mp4`, 1152×2304), each with its six chapters' frames as WebP.
  `tools/journey.py` prints the command for every frame and says how they
  were encoded. `assets/js/journey.js` pins the stage, reads the video whole
  and seeks it frame by frame onto a canvas, following the scroll eased so
  that a wheel's steps glide, and holds each chapter while its words show;
  until the video arrives, the nearest chapter's frame stands in. With
  reduced motion it steps from chapter to chapter; without script, the first
  chapter shows over its frame.
  iOS reads a video only to play it, so the page plays it once, muted, and
  pauses; where the phone refuses (saving power), the hint asks for a tap.
  Add `?debug` to the address to see what the journey does over the page,
  `?debug&auto` to have it scroll itself through.
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
