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
- `assets/img/` — the app's icon at three sizes, the share image, and four
  screenshots from the iOS simulator.

The URLs App Store Connect asks for:

| Field | URL |
|---|---|
| Marketing URL | https://chungtau.github.io/peakline-site/ |
| Support URL | https://chungtau.github.io/peakline-site/#support |
| Privacy Policy URL | https://chungtau.github.io/peakline-site/privacy/ |

To look at it locally: `python3 -m http.server` here, then
http://localhost:8000/.
