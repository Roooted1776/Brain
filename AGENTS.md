# Agents

Brain is Max's personal "Orchestration Brain": one page (`index.html`) that shows his AI programs working together, plus a small memory that learns from those sessions the way the Perplexity help article "What is Brain?" describes.

Canonical repo: **`Roooted1776/Brain`**.

## Hard rule: RedMed stays untouched

Max also has a separate project called RedMed. **Do not read, copy from, change, branch, or open pull requests on RedMed from this repo or this work.** Nothing from RedMed goes into Brain, including text, file names, skills lists or sample data. If a task seems to need RedMed, stop and ask Max.

## Who does what (Max's chart)

| Program | Role | Look on the page | In this repo |
| --- | --- | --- | --- |
| **Grok** | Lead. Commands the repo. | filled white | Sets the order, verifies every change, calls pass or fail. |
| **Claude** | Hub. UI, frontend, logic. | double line | Writes and changes `index.html`. Everything flows through Claude. |
| **Cursor** | Collaborator. Integrates and reviews. | thin line | Merges work into one change and reviews it. |
| **Gemini** | Collaborator. Studies UI together. | thin line | Second reader on layout and long-context cross-checks. |
| **ChatGPT** | Collaborator. Research together. | thin line | Independent research and second opinions. |
| **Grok Bot** | Lead's runner. Runs Grok's orders. | filled white | Hands tasks out and logs every hand-off, so the order is kept. |
| **Perplexity** | Collaborator. Finds and cites sources. | thin line | Source finder. (Retired in the RedMed repo's briefs; on this page it is a scripted bot only.) |
| **Xcode** | Collaborator. Builds iPhone apps. | thin line | iOS builds and device testing. Speaks only for iPhone tasks. |
| **Muse** | Auditor. Audits everyone's work. | dashed line | Reads the finished change and reports problems. Does not edit. |

**Max** is the source of truth. He decides what ships and presses push and merge.

Flow: Grok commands (Grok Bot runs the orders) → Claude plans and builds → Cursor, Gemini, ChatGPT, Perplexity and Xcode work with Claude → Muse audits everyone → Grok verifies and signs off → Max decides.

## Specialties (each bot thinks differently on purpose)

Max asked (2026-10-22) that every bot think from its own angle, to think out of the box. These are Max's starting guesses, not claims about the real products. The Dispatch line tells every bot to find its own row here. The page holds the same text in `NODES` (`index.html`); keep them in step.

| Bot | Specialty | Skills | Angle on a task |
| --- | --- | --- | --- |
| Grok | Challenges the plan and asks what everyone is missing | spotting weak assumptions, contrarian questions, final sign-off | Challenge: what could be wrong, risky, or missing? |
| Grok Bot | Keeps the order: hands tasks out and logs every hand-off | task hand-offs, logging, keeping the order | Order: hand the task to each bot and log every hand-off. |
| Claude | Careful reasoning, clear writing and code | step-by-step plans, clear writing, building the page | Plan: break it into small steps and build it carefully. |
| Cursor | Edits code in the repo and reviews changes | editing files, merging work, code review | Build: which files would change, and what could break? |
| Gemini | Reads lots of material at once and cross-checks it, including pictures and long documents | long documents, images, cross-checking | Cross-check: which long documents or images should we study? |
| ChatGPT | Brainstorms many options fast and gives a second opinion | brainstorming, second opinions, explaining | Options: three different ways to approach it. |
| Perplexity | Finds sources on the web and cites them | web research, citations, fact checking | Sources: what must be looked up and cited? |
| Xcode | Builds and tests iPhone apps | iOS builds, device testing, archives | iPhone check: does it touch an iPhone app? If not, pass. |
| Muse | Audits everyone's work and finds what is wrong | audits, finding bugs, honesty checks | Audit: what could go wrong, and how would we know? |

Everyone gives their angle plus one idea nobody else would suggest (live bots: at most two short sentences).

## What the page models (from the Perplexity article)

1. **Watch.** Brain reviews recent activity in the background: sessions, connected tools, files, and corrections. Incognito sessions are ignored.
2. **Write.** It writes what it learns as linked entries, each pointing at its source: Concepts, Entities, Workstreams.
3. **Maintain.** Each run reinforces what is still true, updates what changed, and marks what is stale.
4. **You stay in charge.** Any entry can be opened, edited or deleted. Your corrections feed forward into the next run.
5. **Memory only.** Brain does not take actions or message you.

Wording checked against the live article on 2026-10-21 (it says it was last modified October 2, 2026). The article shows the Connected sources toggle and Instructions field only in a screenshot and does not explain them. **This page's own ideas, not in the article:** the animations, the black-and-white look, the drifting network and packets of light, the graph shapes and layout (a brain-shaped layout using a placeholder outline until Max's traced one is added); the nine-bot team, the specialties above, and the Dispatch bar; the Plan / Queries / Sources / Answer session and cited answers; the "Report" step of a run; the Skills filter; the incognito switch and "Run Brain now" button; the automatic task queue; sample connectors; the 30-day stale rule and the "skip ahead" demo clock (the article gives no time rule); the rule that a deleted entry is not learned again; the optional Live AI mode; and the password filter (simple pattern matching, not the AI-based filtering the article describes). The page does not connect to Perplexity (the Perplexity bot is scripted).

## Working rules

- One branch per piece of work. Open a **draft** pull request. Nobody merges except Max.
- Never commit passwords, API keys or private data. The page filters common key and password patterns before saving (best effort, not a guarantee) and warns when it sees one. If a real secret shows up in a file, stop and tell Max.
- `index.html` stays a single self-contained file with no build step, so Max can open it by double-click.
- The page is a **simulation by default**. It makes no real AI or search calls unless Max switches on Live AI in Settings (see below). It never uses web search. Its sample sources are lines written for the demo from this repo's own rules and the article, and the page must say so. Never present them as live search.
- Every fact in an answer carries a citation, citations are never reused across sources, and an unanswerable point uses the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- Look: Max asked (2026-10-21) for black and white, Palantir-style, one sans font. Roles are shown by line style, not colour: filled = lead (Grok), double line = hub (Claude), thin line = collaborators (Cursor, Gemini, ChatGPT), dashed = auditor (Muse). Keep Max's chart hierarchy and the dashed audit line from Muse to Claude. Change the look only when Max says so.
- The page is a visualization, not a chat. Tasks run on their own from a built-in queue (Play / Pause / Next task, click a queued task to run it now). Bots drift, and every node and dot can be dragged. Max asked (2026-10-22) for one **Dispatch bar** (a box and an “Everyone, go” button that sends his task to all nine bots and shows a paste-ready line). That is the only text box. Do not add other question boxes unless Max asks.

## Live AI rules (optional mode; Max chose to build it on 2026-10-21)

- **Off by default and off after every reload.** Autopilot never runs live tasks by itself.
- **Keys:** Max creates them. **Never ask Max to paste a key into a chat**, never put a key in a file, commit, test, screenshot, log, backup, transcript, or pull request. Keys live in the browser tab (or the device, only if Max ticks "remember"). If a key ever appears anywhere in the repo, stop and tell Max to rotate it.
- **Spending:** keep the hard limits (calls per page load, tokens per reply, up to 9 calls per normal task, up to 16 for a dispatched one) and the "Stop live now" button. Do not raise a limit or add a loop that makes calls without Max pressing Next task.
- **Honesty:** every model-written message is labeled with its company and model; scripted ones say scripted. A model only writes bot commentary. Facts, citations, and Grok's PASS/FAIL come from this page's own code. Do not claim the real services were tested: only fake servers have been (`tests/live-check.mjs`).
- Never send real keys or real traffic from tests. Tests use fake servers only.

## Before saying "done"

1. Open `index.html` in a browser. Watch a task start on its own. Drag a bot, then Reset layout. Drag the Brain and a memory dot. Run each task in the queue. Check Memory learns, reinforces, and goes stale after "Skip ahead 30 days". Correct and delete an entry. Reload and check memory is still there. Or run `node tests/brain-check.mjs` and `node tests/live-check.mjs` (see README).
2. Check phone width (about 400px) and light and dark mode.
3. Muse audits. Grok verifies. Report pass or fail plainly.
