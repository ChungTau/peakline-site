# Peakline website

The bilingual website for Peakline, the Hong Kong map app for iPhone and
Android. Static HTML, CSS and JavaScript are served by GitHub Pages from `main`;
there is no build step or runtime dependency. `.nojekyll` disables Jekyll.

## Interaction

The landing page uses a native video player with playback controls. Scrolling
does not seek, play or pause the film. The release preview is a fresh recording
from the iPhone app in the simulator, with the latest territory pack installed.
It is labelled as the upcoming version; the public App Store download is separate.
There is no animation loop or whole-video fetch into JavaScript memory.

## Content and assets

- `index.html`: the landing page, current platform/testing availability and
  the version 1.1 preview, App Store download and Android testing steps.
- `privacy/`, `terms/`, `404.html`: the policy, terms and not-found page.
- `assets/launch/`: fresh app screenshots and route preview recorded for this release.
- `assets/journey/`: previous engine films, retained as source/reference assets.
- `tools/journey.py`: the source camera paths and commands used to render the
  film with HK3D's engine. The current hero uses a new app recording.
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
the first play, seeking, download links and native controls.
Scrolling should leave playback unchanged. With scripting unavailable, the
native player and page content should remain available.

## Store URLs

- Marketing: https://chungtau.github.io/peakline-site/
- Support: https://chungtau.github.io/peakline-site/#support
- Privacy: https://chungtau.github.io/peakline-site/privacy/

## FPV motion preview

The hero currently publishes the owner's requested motion preview: Hong Kong
Island hills, Victoria Harbour, a low road between Kowloon's buildings, then a
climb over Lion Rock to reveal the route. It uses the latest full map inputs and
simulated traffic. This is virtual footage, with image-plane banking added in
encoding. The preview has lower resolution and frame rate than final media.

The published movie is `assets/journey/fpv-preview.mp4`; chapter posters under
`assets/journey/fpv/` are extracted from that exact encoded movie. Playback and
chapter selection remain independent of scrolling. App Store phone recordings
are separate assets. The engine workspace's `target/launch-2026-10-15/fpv/`
contains the working recipe, source frames, render logs and encoder.

`tools/journey.py` and `tools/street-flight.py` retain the prior wide aerial and
street-only recipes as references; neither generates this FPV preview.
