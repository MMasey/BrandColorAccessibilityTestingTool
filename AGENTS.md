# Agent Guidance

Entry point for any AI coding agent working in this repo. The detailed guidance
lives in the files below — read the ones relevant to your task rather than
duplicating their content here.

## Where things live

| Document | What it covers |
|----------|----------------|
| [CLAUDE.md](CLAUDE.md) | Architecture, roadmap, design values, constraints, MCP servers, testing strategy, environment rules |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Detailed coding conventions (TypeScript, Lit, naming, style, comments) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Git Flow, Conventional Commits, PR requirements, quality tracking |
| [spec/PROJECT.md](spec/PROJECT.md) | Feature roadmap and status; specs use the SPECKL format (`README.md` + `spec.md` + `tasks.md` per feature) |
| [.claude/skills/](.claude/skills/) | Repeatable workflows: `commit`, `pre-pr`, `release`, `a11y-audit` |

## Non-negotiable guardrails

1. **Git operations require explicit user approval.** Confirm the plan
   (commits, branches, PRs, merges) before executing. Never commit, push, or
   open a PR autonomously.
2. **Release PRs to `main` merge with a merge commit — never squash.** A
   squashed release (v0.3.3) diverged main from develop. After a release,
   main is synced back into develop via a `chore/sync-main-vX.Y.Z` PR.
3. **All tests green locally before a PR is opened** — typecheck, unit
   (`npm run test:run`), and E2E (`npm run test:e2e`, includes axe-core
   accessibility scans). Never open a PR first and verify after.
4. **Accessibility is the product.** WCAG 2.2 AA minimum (AAA for
   high-contrast theme). Fix root causes of axe violations; never suppress a
   rule to make a scan pass.
5. **Derive conventions from the repo, don't guess.** Commit format from
   `git log` + CONTRIBUTING.md; code style from neighbouring files; numbers
   and estimates in documents re-derived from the current repo state, with
   anything unverifiable flagged as such.
6. **Windows environment.** No bash heredocs (they leak stray characters);
   write multi-line payloads — commit messages, JSON — to a temp file and pass
   the file path (`git commit -F <file>`). Prefer file-based payloads over
   inline shell quoting.
7. **MCP servers are preconditions, not conveniences.** If a required server
   (`playwright`, `axe`, `wcag`) is unavailable or drops mid-task, stop and
   say so — don't silently improvise a workaround.
