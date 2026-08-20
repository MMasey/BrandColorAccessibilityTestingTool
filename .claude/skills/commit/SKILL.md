---
name: commit
description: Stage and commit changes following this repo's Conventional Commits convention. Use whenever the user asks to commit, or asks to split work into commits.
---

# Commit

Commit workflow for this repo. Follow every step in order — do not skip the
confirmation step; CLAUDE.md requires explicit approval before any git operation.

## Steps

1. **Review the working tree.** Run `git status` and `git diff` (plus
   `git diff --staged` if anything is already staged). Identify anything that
   must NOT be committed:
   - `.playwright-mcp/` browser session artifacts
   - Playwright reports/snapshots (visual E2E baselines are gitignored)
   - `.env` or anything containing a key (only `.env.example` is tracked)
   - Unrelated scratch/debug files

2. **Derive the convention — never guess.** Run `git log --oneline -50` and
   read [CONTRIBUTING.md](../../../CONTRIBUTING.md#commit-messages). This repo uses
   Conventional Commits:
   - `type(scope): subject` — imperative mood, lowercase, no period, ≤50 chars
   - Types in use: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`
   - Scopes in use: `a11y`, `ci`, `perf`, `spec`, feature IDs (`101`, `107`),
     and component/util names (`contrast-grid`, `color-utils`)
   - Body explains what and why; footer references issues (`Closes #123`)

3. **Propose the split.** Group changes into logical commits (spec/docs changes
   separate from code; each feature/fix self-contained). Show the user the
   proposed commits with their exact messages and file lists. **Wait for
   approval before committing.**

4. **Commit via message files — never heredocs or inline `-m` with newlines.**
   On Windows, heredocs leak stray `@` characters and quoting mangles bodies.
   For each commit:
   - Write the full message to a file in the session scratchpad directory
     (e.g. `<scratchpad>/commit-msg-1.txt`)
   - Stage the exact files: `git add <paths>` (never `git add -A` blindly)
   - `git commit -F <scratchpad>/commit-msg-1.txt`

5. **Verify each commit.** Run `git log -1 --stat` and confirm the message
   rendered cleanly (no stray characters) and the file list matches the plan.
   Confirm nothing intended was left unstaged with a final `git status`.

## Notes

- Do not push unless the user asked for that too — pushing is a separate
  approval.
- If a pre-commit hook fails, fix the underlying issue; never `--no-verify`.
