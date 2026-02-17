# Generate Scope-Audited Codex Build Prompt

You are generating a prompt for a NEW Codex chat. Do NOT execute any code yourself.
Do NOT create, modify, or build any project files. OUTPUT ONLY.

## Workflow

### Step 1: Gather Context
- Read the current project state from the codebase (stats_hub.js, stats_hub.html, stats_hub.css)
- Read `PHASES.md` in the project root (the phase definitions file)
- Read existing test files in `tests/` to understand verification criteria

### Step 2: Confirm Scope
- Ask which phase to target (default: next incomplete phase)
- Read the phase definition from PHASES.md for the target phase
- Display the IN SCOPE and OUT OF SCOPE lists and ask the user to confirm before proceeding

### Step 3: Generate the Prompt
Write a single markdown document with these sections:

```
## Context
[Current codebase state, file paths, what exists]

## Scope Constraints
### IN SCOPE (Phase N only)
[Numbered list of exactly what to build]

### OUT OF SCOPE — DO NOT BUILD
[Numbered list of what is explicitly excluded]

## Tasks
[Detailed task descriptions with specs]

## Rules
[Technical constraints: vanilla JS, no frameworks, etc.]

## Verification
[Test commands and expected results]
[Include: "If any test fails, fix source code — NEVER edit test files."]
```

### Step 4: Self-Audit
Before outputting the final prompt, audit it against the phase definition:

1. For every file, feature, or task mentioned in the prompt:
   - Check: Is it listed in the phase's IN SCOPE section?
   - If NOT in scope → REMOVE it and log it in an "Audit Removals" section
2. For every item in the phase's OUT OF SCOPE list:
   - Check: Is it accidentally referenced in any task?
   - If found → REMOVE the reference and log it
3. Count the scope violations found and report them

### Step 5: Output
- Show the audit results summary (X violations found, X removed)
- Output the final audited prompt in a single copyable code block
- If zero violations were found, say "Clean — no scope violations detected"

## Key Rules
- NEVER execute any tasks described in the prompt
- NEVER create or modify project files
- If PHASES.md doesn't exist, ask the user to define the phase scope before proceeding
- If the user's request includes items from multiple phases, warn them and ask which phase to limit to
- Be aggressive about cutting scope — a tight prompt that works beats a sprawling one that drifts
