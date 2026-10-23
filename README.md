# Brain

Owner's **Orchestration Brain**. Open `index.html` in a browser (double-click it). No install is needed. Live AI is off until you configure a provider, enable it in Settings, and send a prompt.

## What it does

A free-floating black-and-white hive mind. In the default view, a hollow, procedural 3D wire mesh is built from vertices and rendered by WebGL; orbiting rotates that geometry, not a picture. Traced folds guide the surface and memory-node placement. The irregular folds and paired hemispheres are anatomy cues from [OpenStax Anatomy & Physiology](https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system). This remains a stylized schematic, not a full anatomical model or MRI reconstruction.

- **Living network.** Each bot is a node that drifts gently and is pulled by springs along its connections. **Drag any node** and the rest stretch with it; it stays where you drop it. Drag the brain hub to move it; the halo stays anchored to it. Drag the mesh or empty stage to orbit freely through 720° and beyond; the mesh gets a slight motion blur while moving. Idle agents stay visually quiet; a colored neuron pulse, matching provider/model label, and moving handoff appear only during an actual live model request. Use the wheel or +/− controls to zoom from 25% to 450%.
  - **Team network** (nine programs): Grok Bot leads across projects; Claude builds; Grok challenges assumptions; Gemini checks context; Muse audits; Codex, Claude, Cursor and Perplexity perform the third review together. The final report goes to Grok Bot for the decision. Each program is labeled by its strength (Team tab).
  - **Hive mind · 4D** (the default view): agents listen around a hollow, generated WebGL mesh, with linked memory nodes projected onto traced folds when memories exist. Drag empty space to orbit, drag a memory dot to move it, or use the wheel and zoom buttons.
- **Prompts** move through a sequential review-and-handoff chain, shown in Activity. Each connected role reviews its incoming handoff, contributes text, and passes it on.
- **Brain learns afterwards**, in the background, in four steps shown on the Memory tab: review recent activity, write what it learns, reinforce / update / mark stale (these three follow the article), then a report (this page's own step).
- **Memory tab and graph**: browse Concepts, Entities, Workstreams and Skills. Each memory has a persistent category color and a visible title label; related saved session entries connect as a web. Select a memory to zoom to it and expand its note, type, status, source, related memories, and any actual saved model responses linked to it. Provider/model labels use the same color as the live model indicator. Open its full entry to edit, delete, or confirm it is still true. Corrections change later answers.
- **Settings**: Brain on/off, incognito tasks, instructions, privacy notes, and optional **Live AI** (below). No external sources are connected.
- **Skip ahead 30 days (demo)** shows how stale marking works.
- **Backup and restore** for memory; **Copy transcript** for a task.

The learning steps follow Perplexity's help article [“What is Brain?”](https://www.perplexity.ai/help-center/en/articles/19700001-what-is-brain). Wording was checked against the live article on 2026-10-21 (last modified October 2, 2026 per the article). In the article, Brain is a Research Preview for eligible paid subscribers using Perplexity Computer. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the graph shapes and layout; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step; the Skills filter; the incognito switch and "Run Brain now" button; sample connectors; the 30-day stale rule and "skip ahead" clock (the article gives no time rule); the rule that a deleted entry is not learned again; the optional Live AI mode; and the password filter (simple pattern matching, not the article's AI-based filtering).

## Live AI (off until you connect it; provider charges may apply)

Choose one of the supported API providers—Anthropic, OpenAI, Google, or xAI—and enter one key and model ID in Settings. The same selected model powers all nine distinct role prompts; this connects model APIs, not separate apps such as Cursor, Muse, or Xcode. Perplexity's role is text-only and does not use Perplexity's service or browse. Each model response is labeled with the provider and model.

The provider generates each role's text plan, review, and handoff. Each role receives the task and the immediately preceding handoff; Grok Bot receives the full prior chain. It does not get repository, app, or build tools. Model text is unverified, and Grok Bot's report is a recommendation; Owner controls changes, Git push, and merge.

- **You create the key yourself** on the selected provider's website and enter it in Settings. Never paste a key into chat. Only one key is configured at a time; it stays in the browser tab unless you tick "Remember this key on this device." Switching providers clears the previous key. Keys are never written to memory backups, transcripts, or this repo.
- **It only works when you open `index.html` from your computer.** A browser preview may block calls to other websites.
- **Live AI turns off after every reload.** No provider calls happen until you enable it and send a prompt.
- **Spending limits:** one API key, up to 9 calls for a full team handoff, a default output limit of 120 tokens per call (maximum 150), and a default page budget of 9 calls. Testing the connection costs a call from the same budget. "Stop live now" cancels calls in progress. Actual charges depend on the selected provider/model and its current pricing.
- **Privacy and retention:** the task and incoming handoff go to the selected provider, including for incognito prompts; Grok Bot receives the full prior chain, and saved memory is not sent. Google includes the key in the request URL, which may appear in browser network tools. Check the provider's current data settings before sending.
- **Model IDs** are editable because providers change their catalogs. The example IDs are starting values, not confirmed against live services; use a currently supported ID from the selected provider.
- **Not tested against live services.** The browser checks use fake servers only. They verify request structure, labeling, call limits, key handling, and stop behavior; they cannot prove a provider accepts the request.

## How to test (optional, for developers)

The page itself needs nothing installed. To re-run the browser checks:

1. `npm install --no-save playwright` (once), then `npx playwright install chromium` if you have no browser for it. (Opening `index.html?autoplay=0` starts the page paused, which the tests use.)
2. `node tests/mesh-check.mjs` (generated WebGL mesh, free orbit, zoom limits, memory focus, labels/colors, and links), `node tests/handoff-check.mjs` (all nine role handoffs with one fake provider), and `node tests/brain-check.mjs` / `node tests/live-check.mjs` (page, memory, privacy, key, spending-limit, and provider-adapter checks; all provider traffic is intercepted by fake servers)
3. Read the output. Lines starting with PASS are good. At the end you should see `ERRORS []` and `ALL CHECKS PASSED`. If any line starts with FAIL, the script says how many failed and exits with an error code.

The checks cover the generated mesh, free orbit beyond 720°, zoom range and motion blur, focusing and expanding a memory, all nine handoff roles on one provider, fake request shapes for each supported provider, key privacy, spending caps, stop behavior, memory correction/deletion, responsive layout, and reload.

## Honest limits

- With Live AI off, the page makes no provider calls. When enabled, one selected provider model powers the role prompts; the page does not connect to separate AI apps or Perplexity's service, and it does not use web search.
- Sample sources are lines written for this demo from the repo's own rules and the article. A question they do not cover gets the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- "Connected sources" are samples, not real accounts.
- Memory is stored in this browser only. Back it up.
- Common password and key patterns are filtered before saving. This is best effort, not a guarantee. Do not paste real secrets.
- Fonts load from Google Fonts when you are online. Offline, system fonts are used.
- Recency cannot be confirmed: the sample lines have no dates, and answers say so.

## Team and rules

See [`AGENTS.md`](AGENTS.md). RedMed is a separate project and is never touched from here.
