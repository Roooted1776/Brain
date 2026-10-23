"""Turns hand-traced points from one MRI slice into the numbers Brain draws (mri/brain-outline.json).

Only these traced points are kept. No scan pixels, names, dates or other patient data are stored here.
The points are in the slice's own pixel units (384 x 384, midline side view, face on the left).
Run:  python3 mri/trace.py     (needs nothing but Python 3)
"""
import json, os

# ---- traced from the middle side-view slice of the T2 FLAIR 3D series (face on the left) ----
OUTLINE = [(62,140),(63,118),(70,98),(85,84),(102,75),(122,67),(142,62),(165,62),(188,62),(220,66),(245,71),(263,79),(285,98),(307,120),(330,147),(341,172),(338,203),(331,227),(314,250),(288,264),(254,277),(236,268),(228,248),(221,236),(207,217),(193,200),(180,184),(160,180),(130,187),(97,188),(72,177),(61,155)]
FOLDS = [  # long folds drawn inside: corpus callosum, cingulate, central, parieto-occipital, cerebellum
  [(132,145),(152,130),(180,127),(210,135),(232,152),(237,165)],
  [(95,115),(140,115),(175,112),(215,115),(255,132)],
  [(184,67),(182,90),(190,97)],
  [(265,122),(277,145),(290,165)],
  [(247,215),(265,225),(285,237)],
  [(255,240),(275,252)],
  [(240,200),(257,205),(280,215)],
]
# memory regions and the hub, as centres and radii in slice pixels
HUB = (185, 120)
REGIONS = {"concept": (170, 95, 85, 28), "entity": (150, 158, 70, 15), "workstream": (275, 235, 28, 18)}

W, H, S, OX, OY = 1000, 740, 3.2, 55, 58   # box size, scale, slice origin that lands at the box margin
def box(p): return ((p[0]-OX)*S+35, (p[1]-OY)*S+30)

def smooth(pts, closed):
    """Catmull-Rom curve through the points, written as SVG cubic curves."""
    P = [box(p) for p in pts]; n = len(P)
    g = (lambda i: P[i % n]) if closed else (lambda i: P[max(0, min(n-1, i))])
    d = "M%.0f %.0f" % P[0]
    for i in range(n if closed else n-1):
        p0, p1, p2, p3 = g(i-1), g(i), g(i+1), g(i+2)
        c1 = (p1[0]+(p2[0]-p0[0])/6, p1[1]+(p2[1]-p0[1])/6); c2 = (p2[0]-(p3[0]-p1[0])/6, p2[1]-(p3[1]-p1[1])/6)
        d += " C%.0f %.0f %.0f %.0f %.0f %.0f" % (c1+c2+p2)
    return d + (" Z" if closed else "")

def inside(poly, x, y):
    c = False; j = len(poly)-1
    for i in range(len(poly)):
        if (poly[i][1] > y) != (poly[j][1] > y) and x < (poly[j][0]-poly[i][0])*(y-poly[i][1])/(poly[j][1]-poly[i][1])+poly[i][0]: c = not c
        j = i
    return c

out = {"w": W, "h": H, "hub": dict(zip("xy", map(round, box(HUB)))), "outline": smooth(OUTLINE, True), "folds": [smooth(f, False) for f in FOLDS], "regions": {}}
poly = [box(p) for p in OUTLINE]
for k, (cx, cy, rx, ry) in REGIONS.items():
    b = box((cx, cy)); out["regions"][k] = {"cx": round(b[0]), "cy": round(b[1]), "rx": round(rx*S), "ry": round(ry*S)}
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        assert inside(poly, b[0]+dx*rx*S, b[1]+dy*ry*S), k + " region pokes outside the brain"
assert inside(poly, *box(HUB))
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "brain-outline.json"), "w"), indent=1)
print("wrote mri/brain-outline.json")
