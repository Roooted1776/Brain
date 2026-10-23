# mri/ — the shape of Brain

`brain-outline.json` stores the traced outline from one side-view MRI slice. The app uses those dimensions to scale its free-floating, inside-facing two-hemisphere schematic. Animated listening pulses and handoffs supply motion over time; the schematic is not a medical rendering or a reconstruction of the MRI volume.

- `brain-outline.json` — the same numbers that sit in the `BRAIN` block of `index.html` (outline, folds, where each kind of memory lives, hub position). The page keeps its own copy so it still opens by double-click; if you change one, change the other.

**Privacy rule: scan files never go in this repo.** No DICOM files, no `DICOMDIR`, no pictures of the scan (a side view shows the face), no names, dates or IDs. Only the traced numbers are kept. The original disc stays on Owner's computer.
