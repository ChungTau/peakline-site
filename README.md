# Peakline website

The bilingual website for Peakline, the Hong Kong map app for iPhone and
Android. Static HTML, CSS and JavaScript are served by GitHub Pages from `main`;
there is no build step or runtime dependency. `.nojekyll` disables Jekyll.

## Interaction

The landing page uses a native video player with playback controls and explicit
chapter buttons. Scrolling does not seek, play or pause the film, and sections
stay visible without scroll-triggered animation. There is no canvas, animation
loop or whole-video fetch into JavaScript memory. Playback starts with the
visitor; the video uses `preload="none"` and a chapter poster.

`assets/js/journey.js` connects the chapter buttons and captions to the existing
film. Chapter selection pauses and seeks when metadata is available. Native
controls remain usable without JavaScript. `assets/js/site.js` switches English
and Traditional Chinese and keeps the visitor's language preference locally.

## Content and assets

- `index.html`: the landing page, current platform/testing availability and
  the version 1.1 preview.
- `privacy/`, `terms/`, `404.html`: the policy, terms and not-found page.
- `assets/journey/land.mp4`: the current flight; chapter posters are under
  `assets/journey/land/`. The existing portrait assets remain available.
- `tools/journey.py`: the source camera paths and commands used to render the
  film with HK3D's engine. The site update reuses those assets.
- `assets/img/`: app icons, share image and iOS simulator screenshots.

Store availability follows the actual release state: an uploaded/test build is
not described as a public release. Platform requirements come from the app's
Xcode and Gradle configuration. The privacy text distinguishes local app
processing from optional system backups and store services.

## Verify and preview

```sh
node --check assets/js/site.js
node --check assets/js/journey.js
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Check desktop and phone layouts, both languages,
keyboard chapter selection, the first play, paused seeking and native controls.
Scrolling should leave playback unchanged. With scripting unavailable, the
native player and page content should remain available.

## Store URLs

- Marketing: https://chungtau.github.io/peakline-site/
- Support: https://chungtau.github.io/peakline-site/#support
- Privacy: https://chungtau.github.io/peakline-site/privacy/
