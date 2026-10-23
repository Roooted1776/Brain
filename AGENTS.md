# Agents

Brain is Owner's personal "Orchestration Brain": one page (`index.html`) that shows his AI programs working together, plus a small memory that learns from those sessions the way the Perplexity help article "What is Brain?" describes.

Canonical repo: **`Roooted1776/Brain`**.

## Hard rule: RedMed stays untouched

Owner also has a separate project called RedMed. **Do not read, copy from, change, branch, or open pull requests on RedMed from this repo or this work.** Nothing from RedMed goes into Brain, including text, file names, skills lists or sample data. If a task seems to need RedMed, stop and ask Owner.

## Who does what (Owner's chart)

| Program | Role and strength | Look on the page | In this repo |
| --- | --- | --- | --- |
| **Grok Bot** | Team head across every project; gathers the three checks and makes the final team decision. | filled white | Routes the work, logs hand-offs, and gives the final PASS or FAIL. |
| **Grok (xAI)** | Strategy reviewer; challenges assumptions, risks, and missed options. | thin line | Gives an independent challenge; does not overrule Grok Bot. |
| **Claude (Anthropic)** | Careful reasoning, writing, and code. | double line | Plans and builds the single-file page. |
| **Cursor** | Repository editing and code integration. | thin line | Reviews the actual changed files and integration risks. |
| **Gemini (Google)** | Multimodal and long-context cross-checking. | thin line | First review check: inspect relevant context, documents, images, and UI. |
| **Codex (OpenAI)** | Tool use, coding, planning, and synthesis. | thin line | Consolidates findings from the third review check. |
| **Perplexity** | Web research and citations. | thin line | Checks claims against sources; scripted in this page, not connected to its service. |
| **Xcode (Apple)** | iOS builds and device work. | thin line | Checks iPhone-related work when relevant. |
| **Muse** | Independent audit and issue finding. | dashed line | Second review check: report errors, risks, and missing evidence. |

Grok Bot is the head of the AI team across projects and has the final team decision after the review checks. Owner remains the repository owner and controls Git push and merge.

## Three-check review order

1. **Gemini:** first pass for context, long documents, images, and whether the work fits the request.
2. **Muse:** second pass, independently checking errors, gaps, risks, and evidence.
3. **Collective review:** Codex synthesizes; Claude checks reasoning and implementation; Cursor checks the repository changes; Perplexity checks source quality and citations. They combine their findings as the third check.

Codex brings the three-check report to Grok Bot. Grok Bot makes and records the final team decision (PASS or FAIL) for every project. Keep this order even when a program is scripted or unavailable; state clearly when a review was unavailable or only modeled by a role prompt. Owner controls repository ownership and external Git actions.

For a live task, each connected agent must review the incoming handoff before doing its own assigned work, then return a concrete text deliverable and handoff to the next agent. Continue in order through the chain to Grok Bot, who reviews the complete set and gives the final situation report. Unmapped or failed stages are visibly marked unavailable/incomplete; never replace them with fake success. In this single-file page, model work is limited to plans, reviews, and handoff text: it cannot edit the repository, use tools, browse, or run builds. Grok Bot's report is not permission to change files, push, or merge.

## Specialties (each bot thinks differently on purpose)

Use each program's name and actual strength in reports; do not label every program as a generic reviewer. For this page, the brief descriptions above are the starting point. Keep `NODES` (`index.html`) in step with this table. Grok Bot's leadership applies across projects, not only this Brain repo.

## What the page models (from the Perplexity article)

1. **Watch.** This page processes prompts and replies sent through it, plus notes and corrections the Owner adds. It does not watch other apps or connected tools. Incognito sessions are ignored.
2. **Write.** It writes what it learns as linked entries, each pointing at its source: Concepts, Entities, Workstreams.
3. **Maintain.** Each run reinforces what is still true, updates what changed, and marks what is stale.
4. **You stay in charge.** Any entry can be opened, edited or deleted. Your corrections feed forward into the next run.
5. **Memory only.** Brain does not take actions or message you.

Wording checked against the live article on 2026-10-21 (it says it was last modified October 2, 2026). The article shows the Connected sources toggle and Instructions field only in a screenshot and does not explain them. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the two outlined hemispheres, listening pulses and time-based motion; the nine-bot team and the specialties above; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step of a run; the Skills filter; the incognito switch and "Run Brain now" button; the 30-day stale rule and the "skip ahead" demo clock (the article gives no time rule); the rule that a deleted entry is not learned again; the optional Live AI mode; and the password filter (simple pattern matching, not the AI-based filtering the article describes). The Perplexity role uses the selected model for source checking but does not call Perplexity's service or browse.

## Working rules

- **MRI privacy:** traced dimensions from Owner's own MRI are in `mri/`; the visible paired-hemisphere diagram is a schematic, not a scan reconstruction. Only the traced outline numbers belong in this repo. Never add DICOM files, scan pictures (a side view shows the face), names, dates or IDs.
- One branch per piece of work. Open a **draft** pull request. Nobody merges except Owner.
- Never commit passwords, API keys or private data. The page filters common key and password patterns before saving (best effort, not a guarantee) and warns when it sees one. If a real secret shows up in a file, stop and tell Owner.
- `index.html` stays a single self-contained file with no build step, so Owner can open it by double-click.
- **Live AI is off by default.** The page makes no provider calls until Owner enables Live AI and sends a prompt. It never uses web search. Any scripted lines or sample sources must be labeled as such and must never be presented as live research.
- Every fact in an answer carries a citation, citations are never reused across sources, and an unanswerable point uses the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- Look: monochrome team and brain styling, one sans font, free-floating with no enclosing stage panel. Memory nodes are the exception: use distinct, persistent colors for Concepts, Entities, and Workstreams, show every memory's title on the graph, and retain visible links between related memories. The default Hive mind view uses a hollow procedural 3D wire mesh built from vertices and rendered with WebGL, shaped from the traced contour and folds, with agents and linked memory nodes. It is a schematic, not an anatomical model or MRI reconstruction. Keep interior detail to active agent, memory and handoff signals. Show a colored agent pulse, matching provider/model text, halo pulse, and moving handoff only during a real live provider request; idle agents do not appear to be listening or firing. Team roles are shown by line style, not colour: filled = team head (Grok Bot), double line = builder hub (Claude), thin line = reviewers and collaborators (Grok, Cursor, Gemini, Codex), dashed = auditor (Muse). Keep Perplexity and Xcode on the team map. Change the look only when Owner says so.
- The page is a visualization, not a chat. A live task starts only when Owner enables Live AI and presses Send prompt; Brain's memory-maintenance run does not send prompts. Bots drift, any node can be dragged, the brain hub can be dragged to move it, and the mesh or empty stage can be dragged to orbit. Do not add additional task or question boxes unless Owner asks.

## Live AI rules (optional mode; Owner chose to build it on 2026-10-21)

- **Off by default and off after every reload.** Autopilot never runs live tasks by itself.
- **Keys:** Owner creates them. **Never ask Owner to paste a key into a chat**, never put a key in a file, commit, test, screenshot, log, backup, transcript, or pull request. Keys live in the browser tab (or the device, only if Owner ticks "remember"). If a key ever appears anywhere in the repo, stop and tell Owner to rotate it.
- **One provider, one key:** the selected API provider/model powers all nine distinct role prompts. This is not a connection to separate apps such as Cursor, Muse, or Xcode; the Perplexity role does not browse or call Perplexity's service.
- **Spending:** retain the 9-call maximum per task and page load, the conservative output-token cap, and "Stop live now". Do not raise a limit or add a loop that makes calls without Owner pressing Send prompt.
- **Honesty:** every model-written message is labeled with its company and model. Live model stages review the incoming handoff, perform their role's text-only task, then hand off. Failed stages are marked incomplete and never replaced with success-shaped scripted text. The selected model has no repo, browser, or build tools in this page. Facts, citations, and deterministic pass/fail checks come from this page's own code; Grok Bot's report is a recommendation, not an edit or merge. Do not claim real services were tested: only fake servers have been (`tests/live-check.mjs`).
- Never send real keys or real traffic from tests. Tests use fake servers only.

## Before saying "done"

1. Open `index.html` in a browser. Drag the brain mesh to orbit it, zoom in/out, focus a memory dot and expand its details, then reset the view. Add a note, correct it, and delete it; reload and confirm that memory persists. Run `node tests/brain-check.mjs`, `node tests/live-check.mjs`, `node tests/handoff-check.mjs`, and `node tests/mesh-check.mjs` (see README).
2. Check phone width (about 400px) and light and dark mode. Keep provider calls off unless Owner explicitly enables them and sends a prompt.
3. Complete the review sequence above: Gemini checks context, Muse independently audits, then Codex, Claude, Cursor and Perplexity combine their specialty reviews. Codex brings the findings to Grok Bot, who makes the final team PASS or FAIL decision. Report unavailable checks plainly.
