# Brain

Max's **Orchestration Brain**. Open `index.html` in any browser (double-click it). No install, free by default. The optional Live AI mode needs your own keys and costs money.

## What it does

A live view of Max's bots working together. Black and white, one sans font. **Tasks run on their own** (Play / Pause / Next task controls, and a task queue you can click to run one now).

- **Living network.** Each bot is a node that drifts gently and is pulled by springs along its connections. **Drag any node** and the rest stretch with it; it stays where you drop it. "Reset layout" puts everything back. A "Drift" switch turns the floating off.
  - **Team network** (Max's chart, nine bots): Grok (lead, filled) → Claude (hub, double line) and Grok Bot (lead); Claude → Cursor, Gemini, ChatGPT, Perplexity, Xcode (collaborators, thin line); Muse (auditor, dashed) is joined to Claude by a dashed curve. Each bot has its own specialty, skills and angle (Team tab). A packet of light travels along the line each time work is handed over.
  - **Memory graph** (the default view, laid out inside a brain shape; the outline is a placeholder until Max's traced one is added): what Brain has learned. Circle = concept, square = entity, triangle = workstream. Dots pop in when learned, pulse when seen again, flash when updated, and turn dashed when stale. Drag any dot.
- **Dispatch bar.** Type a task, press **Everyone, go**: all nine bots jump, each gives its own angle, then the normal task runs. The box also shows one paste-ready line with a Copy button. Grok, ChatGPT, Gemini and Perplexity are separate apps, so this page cannot push the task into them; you paste the line into each, and each reads `AGENTS.md` (Specialties) and follows the chart.
- **Tasks** move through four phases as a conversation between the programs (plan, 3–5 searches, source check, cited answer), shown in the Activity tab.
- **Brain learns afterwards**, in the background, in four steps shown on the Memory tab: review recent activity, write what it learns, reinforce / update / mark stale (these three follow the article), then a report (this page's own step).
- **Memory tab**: browse Concepts, Entities, Workstreams and Skills. Open an entry's source (a saved task replays), edit it, delete it, or confirm it is still true. Corrections change later answers.
- **Settings**: Brain on/off, incognito tasks, sample connected sources, instructions, privacy notes, and optional **Live AI** (below).
- **Skip ahead 30 days (demo)** shows how stale marking works.
- **Backup and restore** for memory; **Copy transcript** for a task.

The learning steps follow Perplexity's help article [“What is Brain?”](https://www.perplexity.ai/help-center/en/articles/19700001-what-is-brain). Wording was checked against the live article on 2026-10-21 (last modified October 2, 2026 per the article). In the article, Brain is a Research Preview for Max and Enterprise Max subscribers using Perplexity Computer. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the graph shapes and layout; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step; the Skills filter; the incognito switch and "Run Brain now" button; the automatic task queue; sample connectors; the 30-day stale rule and "skip ahead" clock (the article gives no time rule); the rule that a deleted entry is not learned again; the optional Live AI mode; and the password filter (simple pattern matching, not the article's AI-based filtering).

## Live AI (optional, off by default, you pay the providers)

By default every bot is scripted. In Settings you can switch on **Use real AI** and let each bot be voiced by a real model from a different company: Grok by xAI, Claude by Anthropic, ChatGPT by OpenAI, Gemini by Google. Cursor, Muse, Grok Bot and Xcode have no public chat API that I know of (unverified), and Perplexity is not wired to its API yet, so they stay scripted unless you map them to one of the four.

- **You create the keys yourself** on each provider's website and paste them into Settings. Never paste a key into a chat. Keys stay in the browser tab only. Tick "Remember keys on this device" to keep them (anyone using this browser could use them). Keys are never written to memory, backups, transcripts, or this repo.
- **It only works when you open `index.html` from your computer.** The preview link blocks calls to other websites.
- **It turns itself off on every reload.** Live tasks never repeat on their own: autopilot waits for you to press Next task.
- **Spending limits:** up to 9 short calls for a normal task and up to 16 for an “Everyone, go” task, a token limit per reply (default 300), a call limit per page load (default 60), and a "Stop live now" button. Prices differ by model, so check each provider's price page.
- **Stop live now** also cancels any call still in flight. A Google key goes in the web address (that is how Google's docs show it), so it can appear in your browser's network tab. OpenAI is asked not to store prompts; xAI may keep them (unverified), so check each company's data settings.
- **What the models do:** each bot's short message is written by its model and labeled with the company and model. The sample lines, the cited answer, and Grok's pass/fail checks are still produced by this page's own code, so a model cannot put an invented fact into an answer. The task text and the built-in sample lines (never your memory notes) are sent to the companies you map, even for incognito tasks.
- **Model names** (`claude-haiku-5-5`, `gpt-6-luna`, `gemini-3.5-flash-lite`, `grok-4.20-0309-non-reasoning`) came from each provider's docs on 2026-10-21 through a page summary. They change often, so edit them in Settings if a call says "model not found".
- **Not tested against the real services.** `node tests/live-check.mjs` uses fake servers that answer in each company's reply format, which checks how the page builds requests, labels messages, counts calls, protects keys, and stops. It cannot prove the real services accept the requests. A first real try with a small token limit is the real test.

## How to test (optional, for developers)

The page itself needs nothing installed. To re-run the browser checks:

1. `npm install --no-save playwright` (once), then `npx playwright install chromium` if you have no browser for it. (Opening `index.html?autoplay=0` starts the page paused, which the tests use.)
2. `node tests/brain-check.mjs` (the page) and `node tests/live-check.mjs` (live mode, with fake provider servers)
3. Read the output. Lines starting with PASS are good. At the end you should see `ERRORS []` and `ALL CHECKS PASSED`. If any line starts with FAIL, the script says how many failed and exits with an error code.

The checks cover autopilot starting by itself (and not starting under reduced motion), dragging a bot, a dot and the Brain, a bot dropped outside the stage, arrow-key moves, packets of light, tasks never overlapping, learning, reinforcing, correcting, deleting, going stale, incognito, secret filtering, hostile backup files, and reload.

## Honest limits

- By default it is a **simulation**: the programs are scripted, no real AI or web search runs, and nothing connects to Perplexity. Live AI (above) is optional and off.
- Sample sources are lines written for this demo from the repo's own rules and the article. A question they do not cover gets the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- "Connected sources" are samples, not real accounts.
- Memory is stored in this browser only. Back it up.
- Common password and key patterns are filtered before saving. This is best effort, not a guarantee. Do not paste real secrets.
- Fonts load from Google Fonts when you are online. Offline, system fonts are used.
- Recency cannot be confirmed: the sample lines have no dates, and answers say so.

## Team and rules

See [`AGENTS.md`](AGENTS.md). RedMed is a separate project and is never touched from here.
