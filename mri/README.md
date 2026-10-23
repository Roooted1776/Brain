# mri/ — the shape of Brain

The memory graph is drawn inside the outline of Max's own brain, traced from his MRI.

- `brain-outline.json` — the numbers `index.html` uses (outline, folds, where each kind of memory lives). The same numbers sit inside `index.html` so the page still opens by double-click.
- `trace.py` — the hand-traced points (from the middle side-view slice) and the script that turns them into `brain-outline.json`. Run `python3 mri/trace.py`, then paste the new `BRAIN` block into `index.html`.

**Privacy rule: scan files never go in this repo.** No DICOM files, no `DICOMDIR`, no pictures of the scan (a side view shows the face), no names, dates or IDs. Only the traced points are kept. The original disc stays on Max's computer.
