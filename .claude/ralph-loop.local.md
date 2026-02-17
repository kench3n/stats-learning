---
active: true
iteration: 1
max_iterations: 15
completion_promise: "ALL PHASES DONE"
started_at: "2026-02-17T21:10:43Z"
---

You are implementing phases sequentially. The phases are stored in codex_prompts/codex_prompt_{N,O,P,Q,R,S,T,U,V,W,X,Y,Z}.md (Phases 10-22).

WORKFLOW — follow this every iteration:
1. Run: git log --oneline -20 | grep 'Phase'
2. Check which prompts are already done by looking at commit messages for 'Phase 10', 'Phase 11', etc.
3. Map prompts to phases: N=10, O=11, P=12, Q=13, R=14, S=15, T=16, U=17, V=18, W=19, X=20, Y=21, Z=22
4. Find the LOWEST letter prompt not yet committed.
5. Read that prompt file fully (e.g. codex_prompts/codex_prompt_N.md).
6. Implement ALL tasks in the prompt — only modify stats_hub.html, scripts/stats_hub.js, styles/stats_hub.css (and any new files specified by the prompt). NEVER modify tests/.
7. Run: node tests/run_all.js
8. If tests fail, fix source code only and re-run. Never modify tests/.
9. When 185/185 pass: git add -A && git commit -m 'feat: Phase X — description' && git push
10. If all phases N through Z are committed, output: <promise>ALL PHASES DONE</promise>
11. Otherwise stop — the loop will feed this prompt again and you will implement the next phase.

RULES:
- Guard all document/window/localStorage/navigator calls with typeof checks
- Never modify any file in tests/
- One phase per iteration maximum
- Always run tests before committing
