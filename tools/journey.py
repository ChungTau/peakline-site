"""The landing page's journey: the camera's keyframes over Hong Kong, eased
between, the light running from dusk into night. Prints one hk3d-viewer
command line per frame (451 of them):

    python3 tools/journey.py 3840x2160 3 OUT VIEWER PACKS GPX | sh   # landscape
    python3 tools/journey.py 2304x4608 6 OUT VIEWER PACKS GPX | sh   # portrait

The second argument is pixels a point for the route's line and pins (the
viewer's --scale): 3 for a 4K frame shown about 1440 points wide, 6 for a
portrait frame shown 390 wide, as the app draws them. The frames are drawn at
twice (portrait) or 1.5 times (landscape) the size they are shown, then
scaled down with Lanczos and encoded as H.264 at 30 frames a second, a
keyframe every 15 and no reordering, so the page can seek to any frame:
assets/journey/land.mp4 at 2560x1440 and 11 Mbit/s, port.mp4 at 1152x2304
and 8 Mbit/s. Each chapter's frame is also a WebP (q80), c0 to c5, shown
until the video has arrived. The encoder is a small AVFoundation tool; any
H.264 encoder with those settings will do.

VIEWER is the engine's target/release/hk3d-viewer; PACKS, comma-separated,
were Tier 0 and Tier 1 of 2026-09-29-widths with the demo's Yau Tsim Mong
markings and surfaces packs; GPX is MacLehose Trail sections 5 and 6. The
chapters' frames and times are also in assets/js/journey.js (KEYS, MINUTES,
RAMP).
"""
import math, sys

# (east, north, distance m, heading deg, tilt deg, minutes after 17:00, frames to it)
KEYS = [
    (835450, 816800, 6500, 340, 58, 30, 0),    # 1 Hong Kong, in 3D: over the harbour
    (835650, 818700, 1300, 350, 66, 38, 90),   # 2 every street: Nathan Road
    (836900, 822600, 2400, 20, 70, 46, 90),    # 3 every hill: towards Lion Rock
    (837270, 823640, 1900, 280, 64, 54, 90),   # 4 your trail: along the ridge
    (835600, 819350, 300, 30, 58, 240, 90),    # 5 after dark: a tower in Yau Ma Tei, its windows lit
    (835650, 819550, 650, 20, 79, 255, 90),    # 6 share it: up to the trail on the ridge, under the stars
]

# On a phone, tilted further and the last pulled back, so the horizon (and the
# trail along it) sits below the bar at the top instead of under it.
PORTRAIT_TILT = [8, 5, 3, 2, 0, 2.5]
PORTRAIT_DISTANCE = [1, 1, 1, 1, 1, 850 / 650]

def portrait(keys):
    return [(e, n, d * k, h, t + a, m, f) for (e, n, d, h, t, m, f), a, k in zip(keys, PORTRAIT_TILT, PORTRAIT_DISTANCE)]

# Each run speeds up over its first quarter, keeps its speed and slows over
# its last: the camera moves as evenly as it can from frame to frame, at a
# third above its mean speed at most. assets/js/journey.js paces its clock
# the same.
RAMP = 0.25

def ease(s):
    top = 1 / (1 - RAMP)
    if s < RAMP:
        return top * s * s / (2 * RAMP)
    if s > 1 - RAMP:
        return 1 - ease(1 - s)
    return top * (s - RAMP / 2)

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
    size, scale, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    viewer, packs, gpx = sys.argv[4], sys.argv[5].split(","), sys.argv[6]
    w, h = (int(x) for x in size.split("x"))
    for i, (e, n, d, h, t, m) in enumerate(frames(portrait(KEYS) if h > w else KEYS)):
        hh, mm = divmod(int(round(m)), 60)
        pack_args = " ".join(f"--pack {p}" for p in packs)
        print(f"{viewer} --headless {pack_args} --gpx {gpx} --time 2026-10-07T{17 + hh:02d}:{mm:02d} "
              f"--at {e:.1f},{n:.1f} --distance {d:.1f} --heading {h:.2f} --tilt {t:.2f} "
              f"--size {size} --scale {scale} --msaa 4 --out {outdir}/f{i:03d}.png")
