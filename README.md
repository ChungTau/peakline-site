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

## Landscape flight with the current map

The hero is a low virtual flight along a road between buildings, first by day
and then at night, with simulated traffic. It uses the latest full map pack.
Chapter selection and playback remain independent of scrolling. App Store
phone captures are separate assets.

`tools/street-flight.py` prints shell-quoted viewer commands. Supply the current
app's bundled packs first (including Yau Tsim Mong's shared prototypes and
façades), then the full territory pack and the traffic network. The viewer's
`--traffic-camera` keeps a stable population while its clock advances. The
camera follows a straight road interior and rises gently at the night ending.
Vehicle positions are simulated, not real-time traffic observations.

The engine repository's launch verification records input hashes and render
logs. Source frames stay outside Git; the video and chapter posters are in
`assets/journey/`. `tools/journey.py` retains the earlier wide aerial route as a
reference; it is not the current hero's generation command.
