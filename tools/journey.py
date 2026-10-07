"""The landing page's journey: the camera's keyframes over Hong Kong, eased
between, the light running from dusk into night. Prints one hk3d-viewer
command line per frame; run them, then turn the PNGs into WebP:

    python3 tools/journey.py 1600x900 OUT VIEWER PACKS GPX | sh
    cwebp -q 60 -m 6 OUT/f000.png -o assets/journey/land/f000.webp   # each frame
    python3 tools/journey.py 900x1600 OUT VIEWER PACKS GPX | sh        # portrait
    cwebp -q 60 -m 6 -resize 810 1440 ...                             # into port/

VIEWER is the engine's target/release/hk3d-viewer; PACKS, comma-separated,
were Tier 0 and Tier 1 of 2026-09-29-widths with the demo's Yau Tsim Mong
markings and surfaces packs; GPX is MacLehose Trail sections 5 and 6. The
chapters' frames and times are also in assets/js/journey.js (KEYS, MINUTES).
"""
import math, sys

# (east, north, distance m, heading deg, tilt deg, minutes after 17:00, frames to it)
KEYS = [
    (835450, 816800, 6500, 340, 58, 30, 0),    # 1 Hong Kong, in 3D: over the harbour
    (835650, 818700, 1300, 350, 66, 38, 30),   # 2 every street: Nathan Road
    (836900, 822600, 2400, 20, 70, 46, 30),    # 3 every hill: towards Lion Rock
    (837270, 823640, 1900, 280, 64, 54, 30),   # 4 your trail: along the ridge
    (835600, 819350, 300, 30, 58, 240, 36),    # 5 after dark: a tower in Yau Ma Tei, its windows lit
    (835650, 819550, 650, 20, 79, 255, 24),    # 6 share it: up to the trail on the ridge, under the stars
]

# On a phone, tilted further and the last pulled back, so the horizon (and the
# trail along it) sits below the bar at the top instead of under it.
PORTRAIT_TILT = [8, 5, 3, 2, 0, 2.5]
PORTRAIT_DISTANCE = [1, 1, 1, 1, 1, 850 / 650]

def portrait(keys):
    return [(e, n, d * k, h, t + a, m, f) for (e, n, d, h, t, m, f), a, k in zip(keys, PORTRAIT_TILT, PORTRAIT_DISTANCE)]

def ease(s):
    return s * s * (3 - 2 * s)

def frames(keys):
    out = [keys[0][:6]]
    for a, b in zip(keys, keys[1:]):
        n = b[6]
        span = math.hypot(b[0] - a[0], b[1] - a[1])
        dh = ((b[3] - a[3] + 180) % 360) - 180
        for i in range(1, n + 1):
            s = ease(i / n)
            e = a[0] + (b[0] - a[0]) * s
            nn = a[1] + (b[1] - a[1]) * s
            d = math.exp(math.log(a[2]) + (math.log(b[2]) - math.log(a[2])) * s)
            if span > 2000:
                d *= 1 + 0.55 * math.sin(math.pi * s)
            h = (a[3] + dh * s) % 360
            t = a[4] + (b[4] - a[4]) * s
            m = a[5] + (b[5] - a[5]) * s
            out.append((e, nn, d, h, t, m))
    return out

if __name__ == "__main__":
    size, outdir = sys.argv[1], sys.argv[2]
    viewer, packs, gpx = sys.argv[3], sys.argv[4].split(","), sys.argv[5]
    w, h = (int(x) for x in size.split("x"))
    for i, (e, n, d, h, t, m) in enumerate(frames(portrait(KEYS) if h > w else KEYS)):
        hh, mm = divmod(int(round(m)), 60)
        pack_args = " ".join(f"--pack {p}" for p in packs)
        print(f"{viewer} --headless {pack_args} --gpx {gpx} --time 2026-10-07T{17 + hh:02d}:{mm:02d} "
              f"--at {e:.1f},{n:.1f} --distance {d:.1f} --heading {h:.2f} --tilt {t:.2f} "
              f"--size {size} --msaa 4 --out {outdir}/f{i:03d}.png")
