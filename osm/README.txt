Peakline surfaces and stairs, from OpenStreetMap
================================================

Published at https://chungtau.github.io/peakline-site/osm/ on 8 October 2026.

Licence
-------
This database is made available under the Open Database License 1.0 (ODbL):
https://opendatacommons.org/licenses/odbl/1-0/

It is derived from OpenStreetMap, (c) OpenStreetMap contributors, which is
made available under the same licence: https://www.openstreetmap.org/copyright

You may copy, distribute and adapt it under the ODbL's terms: keep this notice
with it, credit OpenStreetMap, and offer what you derive from it under the ODbL.

Files
-----
surfaces.geojson.gz  the lines as GeoJSON (WGS84), each with "surface" (one of
                     asphalt, concrete, paving, gravel, dirt, grass, sand, wood,
                     paved, unpaved, or null) and "stairs" (true or false)
surfaces.hk3a        the same lines exactly as the Peakline app carries them
SHA256SUMS           the files' checksums

What it holds
-------------
From Geofabrik's Hong Kong extract of OpenStreetMap, of 5 October 2026: every
way whose surface tag names a known surface, as one of the ten above; every
way tagged highway=steps, as stairs; the ways of no known surface within 24 m
of those. Each line is simplified to 1 m, its points in the Hong Kong 1980 Grid
(EPSG:2326) in steps of 0.5 m. 135,769 lines (57,266 of a known surface or
stairs, 78,503 of none), 595,867 points.
