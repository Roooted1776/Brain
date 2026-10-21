# Agents

Brain is Max's personal "Orchestration Brain": one page (`index.html`) that shows his AI programs working together, plus a small memory that learns from those sessions the way the Perplexity help article "What is Brain?" describes.

Canonical repo: **`Roooted1776/Brain`**.

## Hard rule: RedMed stays untouched

Max also has a separate project called RedMed. **Do not read, copy from, change, branch, or open pull requests on RedMed from this repo or this work.** Nothing from RedMed goes into Brain, including text, file names, skills lists or sample data. If a task seems to need RedMed, stop and ask Max.

## Who does what (Max's chart)

| Program | Role | Colour | In this repo |
| --- | --- | --- | --- |
| **Grok** | Lead. Commands the repo. | coral | Sets the order, verifies every change, calls pass or fail. |
| **Claude** | Hub. UI, frontend, logic. | purple | Writes and changes `index.html`. Everything flows through Claude. |
| **Cursor** | Collaborator. Integrates and reviews. | teal | Merges work into one change and reviews it. |
| **Gemini** | Collaborator. Studies UI together. | teal | Second reader on layout and long-context cross-checks. |
| **ChatGPT** | Collaborator. Research together. | teal | Independent research and second opinions. |
| **Muse** | Auditor. Audits everyone's work. | gray | Reads the finished change and reports problems. Does not edit. |

**Max** is the source of truth. He decides what ships and presses push and merge.

Flow: Grok commands → Claude plans and builds → Cursor, Gemini and ChatGPT work with Claude → Muse audits everyone → Grok verifies and signs off → Max decides.

## What the page models (from the Perplexity article)

1. **Watch.** Brain reviews recent activity in the background: sessions, connected tools, files, and corrections. Incognito sessions are ignored.
2. **Write.** It writes what it learns as linked entries, each pointing at its source: Concepts, Entities, Workstreams.
3. **Maintain.** Each run reinforces what is still true, updates what changed, and marks what is stale.
4. **You stay in charge.** Any entry can be opened, edited or deleted. Corrections feed the next run. A deleted entry is not learned again.
5. **Memory only.** Brain takes no actions and sends no messages.

The article describes no animations. The moving visuals (draggable Brain, graph dots that pop, pulse and fade) are this page's own design. The page does not connect to Perplexity.

## Working rules

- One branch per piece of work. Open a **draft** pull request. Nobody merges except Max.
- Never commit passwords, API keys or private data. The page filters common key and password patterns before saving (best effort, not a guarantee) and warns when it sees one. If a real secret shows up in a file, stop and tell Max.
- `index.html` stays a single self-contained file with no build step, so Max can open it by double-click.
- The page is a **simulation**. It makes no real AI or search calls. Its sample sources are lines written for the demo from this repo's own rules and the article, and the page must say so. Never present them as live search.
- Every fact in an answer carries a citation, citations are never reused across sources, and an unanswerable point uses the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- Keep the chart's colours and layout (coral lead, purple hub, teal collaborators, gray auditor, dashed audit line from Muse to Claude). Change them only when Max says so.

## Before saying "done"

1. Open `index.html` in a browser. Drag the Brain in both views. Ask each sample question. Check Memory learns, reinforces, and goes stale after "Skip ahead 30 days". Correct and delete an entry. Reload and check memory is still there.
2. Check phone width (about 400px) and light and dark mode.
3. Muse audits. Grok verifies. Report pass or fail plainly.
