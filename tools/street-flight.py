"""Render an engine-generated street-canyon flight with simulated traffic.

Usage: python3 tools/street-flight.py VIEWER PACKS TRAFFIC OUT [--json]
PACKS is comma separated: current bundled packs, then current full territory.
The camera follows the straight interior of HK3V edge 20232 in Yau Ma Tei.
The road network and packs remain external, ignored inputs. No GPX overlay.
The first half is afternoon; the second is a matched night flight, lifting
slightly at the end. This is a virtual flight, not live traffic or drone footage.
"""
import argparse, json, math, shlex
from pathlib import Path

FPS = 30
DURATION = 24
CHAPTERS = [0, 4, 8, 12, 16, 20]
ROAD_START = (835660.54296875, 819180.3984375)
ROAD_END = (835641.0859375, 819289.197265625)


def smooth(x):
    return x * x * (3 - 2 * x)


def camera(seconds):
    local = seconds if seconds < 12 else seconds - 12
    # Constant forward travel; only the night ending lifts, with zero endpoint
    # vertical velocity. The eye stays above the road's centreline throughout.
    north = 819170 + local * 10
    east = ROAD_START[0] + (north - ROAD_START[1]) * (ROAD_END[0] - ROAD_START[0]) / (ROAD_END[1] - ROAD_START[1])
    heading = math.atan2(ROAD_END[0] - ROAD_START[0], ROAD_END[1] - ROAD_START[1])
    height = 18 + (27 * smooth(max(0, min(1, (local - 8) / 4))) if seconds >= 12 else 0)
    ahead = 80
    target = (east + ahead * math.sin(heading), north + ahead * math.cos(heading))
    return target, math.hypot(ahead, height), math.degrees(heading) % 360, math.degrees(math.atan2(ahead, height))


def commands(viewer, packs, traffic, out):
    base = [viewer, '--headless']
    for pack in packs.split(','):
        base += ['--pack', pack]
    base += ['--traffic', traffic, '--traffic-camera', '835650,819000,2000',
             '--size', '1920x1080', '--scale', '1.5', '--msaa', '4']
    for frame in range(FPS * DURATION):
        seconds = frame / FPS
        (east, north), distance, heading, tilt = camera(seconds)
        time = '2026-10-15T17:20' if seconds < 12 else '2026-10-15T20:15'
        yield base + ['--time', time, '--at', f'{east:.4f},{north:.4f}',
                      '--distance', f'{distance:.6f}', '--heading', f'{heading:.6f}',
                      '--tilt', f'{tilt:.6f}', '--traffic-seconds', str(90 + seconds),
                      '--out', str(Path(out) / f'f{frame:04d}.png')]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ['viewer', 'packs', 'traffic', 'out']:
        parser.add_argument(arg)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    result = list(commands(args.viewer, args.packs, args.traffic, args.out))
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        for command in result:
            print(shlex.join(command))
