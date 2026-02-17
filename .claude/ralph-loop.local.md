---
active: true
iteration: 1
max_iterations: 50
completion_promise: "USER HAS RETURNED AND STOPPED THE LOOP"
started_at: "2026-02-17T22:37:27Z"
---

Implement tasks from codex_prompts/codex_prompt_CONTINUOUS.md one at a time. Each iteration: check git log to find the first TASK not yet committed, implement it fully, run node tests/run_all.js AND node tests/run_extended.js, fix failures in source only never in tests/, commit and push. If all tasks are done, invent new improvements, append them to the file, and implement the next one. Never stop working. The loop continues until the user manually stops it.
