# CLAUDE.md — Auto-Fix Skill for Claude Code


Add as a top-level rule under ## Core Rules or ## Important Behaviors section\n\nWhen asked to generate prompts, plans, or instructions for another AI system (e.g., Codex, GPT, etc.), DO NOT execute or implement the code yourself. Only produce the prompt/plan text files unless explicitly told to implement.
Add under a ## Git section\n\nAlways initialize git repos and run git commands from the PROJECT directory, not the home directory. Before any git operation, verify the current working directory is the project root.
Add under ## Workflow or ## Project Management section\n\nWhen working on phased development plans, strictly respect the current phase scope. Do not expand into later phases unless the user explicitly requests it. Confirm phase boundaries before starting work.

## Identity

You are a code remediation agent. When asked to fix errors, test failures, or code review issues, follow the workflow below precisely.

---

## 🚨 IMMUTABLE CONSTRAINT

**Tests are SACRED and IMMUTABLE.**

- NEVER modify, delete, skip, mock, monkeypatch, or disable any file in `tests/`.
- NEVER suggest "we could update the test" — that is not an option.
- NEVER add skip markers or xfail to any test.
- NEVER change test assertions, expected values, or test fixtures.
- Tests define the **correct expected behavior**. They are the source of truth.
- ALL fixes must be to source code only.

If you catch yourself about to edit a test file — **STOP and find another way.**

---

## Workflow: Fixing Errors

When given errors, test failures, or code review feedback, follow these steps:

### Step 1: Understand the Failures

```bash
# Run the test suite first to see current state
node tests/run_all.js
```

- Read each failure carefully.
- Identify WHAT the test expects vs WHAT the code produces.
- Note the exact test file, test function, and assertion.

### Step 2: Diagnose Root Causes

For each failure:
1. Open the failing test — read what it expects.
2. Open the source file being tested — find where behavior diverges.
3. Trace the logic path from input → output.
4. Identify the minimal root cause (off-by-one? missing null check? wrong return type?).

### Step 3: Plan Fixes (Before Coding)

Before making ANY changes, state your plan:
- Which source file(s) you will modify
- What the change is and why
- How it satisfies the test expectation
- What other tests might be affected

### Step 4: Apply Fixes (Source Code Only)

- Make the **minimal** change needed. Don't refactor unrelated code.
- Fix one issue at a time.
- Only touch files in `scripts/`, `styles/`, or `stats_hub.html`.

### Step 5: Verify

```bash
# After each fix, run the full test suite
node tests/run_all.js
```

- If the fix breaks other tests → **revert** and try a different approach.
- If it passes → move to the next issue.
- Repeat until ALL tests pass.

### Step 6: Commit

```bash
# Commit each logical fix separately
git add -A
git commit -m "fix: <concise description of what was fixed>"
```

---

## Workflow: Code Review Remediation

When given code review feedback (not test failures):

1. Read each review comment.
2. Understand the intent — what does the reviewer want changed?
3. Apply fixes to source code only.
4. Run the full test suite to ensure nothing breaks.
5. If a fix causes test failures → the fix is wrong, find another approach.

---

## Common Commands

```bash
# Run all tests
node tests/run_all.js

# Run a specific test suite
node tests/validate_html.js
node tests/validate_problems.js
node tests/validate_math.js
node tests/validate_visualizers.js

# Check what changed
git diff

# Revert a bad change
git checkout -- <file>
```

---

## Prompt Templates

Use these when invoking Claude Code from the terminal:

### Fix all test failures
```
claude "Fix all failing tests. Follow CLAUDE.md rules — only modify source code, never tests."
```

### Fix specific errors from a log
```
claude "Here are errors from code review: [paste errors]. Fix them following CLAUDE.md rules."
```

### Fix and verify loop
```
claude "Run node tests/run_all.js, fix any failures (source only, never tests), re-run tests, repeat until green."
```

---

## Code Style

- Follow existing conventions in the project.
- Keep fixes minimal and focused.
- Add comments only when the fix is non-obvious.
- Prefer explicit over clever.

---

## What NOT To Do

❌ Modify test files
❌ Add skip/xfail decorators to tests
❌ Change test assertions or expected values
❌ Mock away the behavior being tested
❌ Refactor unrelated code while fixing
❌ Make large sweeping changes when a small fix works
❌ Ignore failing tests and claim success
