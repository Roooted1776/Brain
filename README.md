# Brain

Max's **Orchestration Brain**. Open `index.html` in any browser (double-click it). No install, no keys, free.

## What it does

A live view of Max's bots working together. Black and white, one sans font, no question box: **tasks run on their own** (Play / Pause / Next task controls, and a task queue you can click to run one now).

- **Living network.** Each bot is a node that drifts gently and is pulled by springs along its connections. **Drag any node** and the rest stretch with it; it stays where you drop it. "Reset layout" puts everything back. A "Drift" switch turns the floating off.
  - **Team network** (Max's chart): Grok (lead, filled) → Claude (hub, double line) → Cursor, Gemini, ChatGPT (collaborators, thin line); Muse (auditor, dashed) is joined to Claude by a dashed curve. A packet of light travels along the line each time work is handed over.
  - **Memory graph**: what Brain has learned. Circle = concept, square = entity, triangle = workstream. Dots pop in when learned, pulse when seen again, flash when updated, and turn dashed when stale. Drag any dot.
- **Tasks** move through four phases as a conversation between the programs (plan, 3–5 searches, source check, cited answer), shown in the Activity tab.
- **Brain learns afterwards**, in the background, in four steps shown on the Memory tab: review recent activity, write what it learns, reinforce / update / mark stale (these three follow the article), then a report (this page's own step).
- **Memory tab**: browse Concepts, Entities, Workstreams and Skills. Open an entry's source (a saved task replays), edit it, delete it, or confirm it is still true. Corrections change later answers.
- **Settings**: Brain on/off, incognito tasks, sample connected sources, instructions, privacy notes.
- **Skip ahead 30 days (demo)** shows how stale marking works.
- **Backup and restore** for memory; **Copy transcript** for a task.

The learning steps follow Perplexity's help article [“What is Brain?”](https://www.perplexity.ai/help-center/en/articles/19700001-what-is-brain). Wording was checked against the live article on 2026-10-21 (last modified October 2, 2026 per the article). In the article, Brain is a Research Preview for Max and Enterprise Max subscribers using Perplexity Computer. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the graph shapes and layout; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step; the Skills filter; the incognito switch and "Run Brain now" button; the automatic task queue; sample connectors; the 30-day stale rule and "skip ahead" clock (the article gives no time rule); the rule that a deleted entry is not learned again; and the password filter (simple pattern matching, not the article's AI-based filtering).

## How to test (optional, for developers)

The page itself needs nothing installed. To re-run the browser checks:

1. `npm install --no-save playwright` (once), then `npx playwright install chromium` if you have no browser for it. (Opening `index.html?autoplay=0` starts the page paused, which the tests use.)
2. `node tests/brain-check.mjs`
3. Read the output. Lines starting with PASS are good. If any line starts with FAIL the script stops with an error code, and the last line should be `ERRORS []`.

The checks cover dragging the Brain in both views, learning, reinforcing, correcting, deleting, going stale, incognito, secret filtering, hostile backup files, and reload.

## Honest limits

- It is a **simulation**. The programs are scripted. No real AI or web search runs, and nothing connects to Perplexity.
- Sample sources are lines written for this demo from the repo's own rules and the article. A question they do not cover gets the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- "Connected sources" are samples, not real accounts.
- Memory is stored in this browser only. Back it up.
- Common password and key patterns are filtered before saving. This is best effort, not a guarantee. Do not paste real secrets.
- Fonts load from Google Fonts when you are online. Offline, system fonts are used.
- Recency cannot be confirmed: the sample lines have no dates, and answers say so.

## Team and rules

See [`AGENTS.md`](AGENTS.md). RedMed is a separate project and is never touched from here.
