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

Codex brings the three-check report to Grok Bot. Grok Bot makes and records the final team decision (PASS or FAIL) for every project. Keep this order even when a program is scripted or unavailable; state clearly when a review is simulated or could not run. Owner controls repository ownership and external Git actions.

## Specialties (each bot thinks differently on purpose)

Use each program's name and actual strength in reports; do not label every program as a generic reviewer. For this page, the brief descriptions above are the starting point. Keep `NODES` (`index.html`) in step with this table. Grok Bot's leadership applies across projects, not only this Brain repo.

## What the page models (from the Perplexity article)

1. **Watch.** Brain reviews recent activity in the background: sessions, connected tools, files, and corrections. Incognito sessions are ignored.
2. **Write.** It writes what it learns as linked entries, each pointing at its source: Concepts, Entities, Workstreams.
3. **Maintain.** Each run reinforces what is still true, updates what changed, and marks what is stale.
4. **You stay in charge.** Any entry can be opened, edited or deleted. Your corrections feed forward into the next run.
5. **Memory only.** Brain does not take actions or message you.

Wording checked against the live article on 2026-10-21 (it says it was last modified October 2, 2026). The article shows the Connected sources toggle and Instructions field only in a screenshot and does not explain them. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the two outlined hemispheres, listening pulses and time-based motion; the nine-bot team, the specialties above, and the Dispatch bar; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step of a run; the Skills filter; the incognito switch and "Run Brain now" button; the automatic task queue; sample connectors; the 30-day stale rule and the "skip ahead" demo clock (the article gives no time rule); the rule that a deleted entry is not learned again; the optional Live AI mode; and the password filter (simple pattern matching, not the AI-based filtering the article describes). The page does not connect to Perplexity (the Perplexity bot is scripted).

## Working rules

- **MRI privacy:** traced dimensions from Owner's own MRI are in `mri/`; the visible paired-hemisphere diagram is a schematic, not a scan reconstruction. Only the traced outline numbers belong in this repo. Never add DICOM files, scan pictures (a side view shows the face), names, dates or IDs.
- One branch per piece of work. Open a **draft** pull request. Nobody merges except Owner.
- Never commit passwords, API keys or private data. The page filters common key and password patterns before saving (best effort, not a guarantee) and warns when it sees one. If a real secret shows up in a file, stop and tell Owner.
- `index.html` stays a single self-contained file with no build step, so Owner can open it by double-click.
- The page is a **simulation by default**. It makes no real AI or search calls unless Owner switches on Live AI in Settings (see below). It never uses web search. Its sample sources are lines written for the demo from this repo's own rules and the article, and the page must say so. Never present them as live search.
- Every fact in an answer carries a citation, citations are never reused across sources, and an unanswerable point uses the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- Look: black and white, one sans font, free-floating with no enclosing stage panel. The default Hive mind view shows two distinct inside-facing hemisphere outlines, the agents with pulsing listening rings, and linked memory nodes. Keep interior detail to active agent, memory and handoff signals. Use time-based pulses and handoff motion for the 4D effect. Roles are shown by line style, not colour: filled = team head (Grok Bot), double line = builder hub (Claude), thin line = reviewers and collaborators (Grok, Cursor, Gemini, Codex), dashed = auditor (Muse). Keep Perplexity and Xcode on the team map. Change the look only when Owner says so.
- The page is a visualization, not a chat. Tasks run on their own from a built-in queue (Play / Pause / Next task, click a queued task to run it now). Bots drift, and every node and dot can be dragged. Owner asked (2026-10-22) for one **Dispatch bar** (a box and an “Everyone, go” button that sends his task to all nine bots and shows a paste-ready line). That is the only text box. Do not add other question boxes unless Owner asks.

## Live AI rules (optional mode; Owner chose to build it on 2026-10-21)

- **Off by default and off after every reload.** Autopilot never runs live tasks by itself.
- **Keys:** Owner creates them. **Never ask Owner to paste a key into a chat**, never put a key in a file, commit, test, screenshot, log, backup, transcript, or pull request. Keys live in the browser tab (or the device, only if Owner ticks "remember"). If a key ever appears anywhere in the repo, stop and tell Owner to rotate it.
- **Spending:** keep the hard limits (calls per page load, tokens per reply, up to 9 calls per normal task, up to 16 for a dispatched one) and the "Stop live now" button. Do not raise a limit or add a loop that makes calls without Owner pressing Next task.
- **Honesty:** every model-written message is labeled with its company and model; scripted ones say scripted. A model only writes bot commentary. Facts, citations, and Grok's PASS/FAIL come from this page's own code. Do not claim the real services were tested: only fake servers have been (`tests/live-check.mjs`).
- Never send real keys or real traffic from tests. Tests use fake servers only.

## Before saying "done"

1. Open `index.html` in a browser. Watch a task start on its own. Drag a bot, then Reset layout. Drag the Brain and a memory dot. Run each task in the queue. Check Memory learns, reinforces, and goes stale after "Skip ahead 30 days". Correct and delete an entry. Reload and check memory is still there. Or run `node tests/brain-check.mjs` and `node tests/live-check.mjs` (see README).
2. Check phone width (about 400px) and light and dark mode.
3. Complete the review sequence above: Gemini checks context, Muse independently audits, then Codex, Claude, Cursor and Perplexity combine their specialty reviews. Codex brings the findings to Grok Bot, who makes the final team PASS or FAIL decision. Report unavailable or simulated reviews plainly.
