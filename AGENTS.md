# Agents

Brain is Max's personal "Orchestration Brain": one page (`index.html`) that shows his AI programs handing work to each other, plus a small skills memory.

Canonical repo: **`Roooted1776/Brain`**. Max's other project, `Roooted1776/RedMed-V1-Official`, is separate. Do not copy RedMed code or secrets into this repo, and do not change RedMed from here.

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

## Working rules

- One branch per piece of work. Open a **draft** pull request. Nobody merges except Max.
- Never commit passwords, API keys or private data. If one shows up in a file, stop and tell Max.
- `index.html` stays a single self-contained file with no build step, so Max can open it by double-click.
- The page is a **simulation**. It makes no real AI or search calls. The sample sources are real lines from RedMed's `AGENTS.md`, and the page must say so. Do not present them as live search.
- The Orchestration Brain rules are part of the product: every fact in an answer carries a citation, citations are never reused across sources, and an unanswerable point uses the fixed sentence "The provided source documentation does not contain enough verified information to confidently answer …".
- Keep the colours and layout of Max's chart (coral lead, purple hub, teal collaborators, gray auditor, dashed audit line from Muse to Claude). Change them only when Max says so.

## Before saying "done"

1. Open `index.html` in a browser. Drag the Brain. Ask each sample question. Add a skill, reload, and check it is still there.
2. Check it at phone width (about 400px) and in light and dark mode.
3. Muse audits. Grok verifies. Report pass or fail plainly.
