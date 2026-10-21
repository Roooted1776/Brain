# Brain

Max's **Orchestration Brain**. Open `index.html` in any browser (double-click it). No install, no keys, free.

## What it does

- **Draggable Brain** with two views of the stage:
  - **Team chart**: Grok (lead) → Claude (hub) → Cursor, Gemini, ChatGPT (collaborators), with Muse auditing everyone. Arrows light up as a question moves between them.
  - **Memory graph**: everything Brain has learned as dots. Blue = concepts, gold = entities, green = workstreams. Dots pop in when learned, pulse when reinforced, flash when updated, and turn dashed when stale.
- **Ask a question** and watch four phases play out as a conversation between the programs: plan, 3–5 searches, source check, cited answer.
- **Brain learns afterwards**, in the background, in four steps shown on the Memory tab: review recent activity, write what it learns, reinforce / update / mark stale, report.
- **Memory tab**: browse Concepts, Entities, Workstreams and Skills. Open an entry's source (a saved session replays), edit it, delete it, or confirm it is still true. Corrections change the next answer. A deleted entry is not learned again.
- **Settings**: Brain on/off, connected sources (sample connectors), instructions, privacy notes.
- **Incognito** checkbox: the session is not saved and Brain ignores it.
- **Skip ahead 30 days (demo)** shows how stale marking works.
- **Backup and restore** for memory; **Copy transcript** for a conversation.

The learning steps follow Perplexity's help article [“What is Brain?”](https://www.perplexity.ai/help-center/en/articles/19700001-what-is-brain). Wording was checked against the live article on 2026-10-21 (last modified October 2, 2026 per the article). In the article, Brain is a Research Preview for Max and Enterprise Max subscribers using Perplexity Computer. The article describes no animations; the moving visuals are this page's own design.

## How to test (optional, for developers)

The page itself needs nothing installed. To re-run the browser checks:

1. `npm install --no-save playwright` (once), then `npx playwright install chromium` if you have no browser for it.
2. `node tests/brain-check.mjs`
3. Read the output. Every line should start with PASS, and the last line should be `ERRORS []`.

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
