---
name: release
description: Cut a Git Flow release (release/vX.Y.Z from develop, PR to main, sync back). Use when the user asks to cut, prepare, or finish a release. Encodes the never-squash rule and the main→develop sync-back.
---

# Release

Git Flow release process for this repo. Confirm the full plan (version number,
branch names, PR sequence) with the user before executing any git operation.

## Hard rules (learned the hard way)

- **Release PRs to `main` merge with a MERGE COMMIT — never squash.**
  Squashing v0.3.3 caused main/develop divergence that required a manual
  merge-back fix. If `gh pr merge` is used: `--merge`, never `--squash`.
- **After the release lands on main, main must be synced back into develop**
  via a `chore/sync-main-vX.Y.Z` branch and PR (see PR #38 for the pattern).
- **Quality artifacts (visual milestone + Lighthouse) are captured by CI on
  release PRs only.** Do not commit them manually on the release branch or you
  recreate the commit loop fixed in 5d146fa.

## Steps

1. **Preconditions**: on `develop`, clean working tree, all intended feature
   PRs merged, latest develop CI run green (`gh run list --branch develop`).
2. **Branch**: `git checkout -b release/vX.Y.Z` from up-to-date develop.
3. **Version bump**: update `version` in package.json.
4. **CHANGELOG.md**: derive entries from `git log <last-release-tag>..HEAD`
   at the time of writing — never carry figures or claims from memory or an
   earlier draft. Follow the existing entry format in CHANGELOG.md.
5. **Verify**: run the `pre-pr` skill gates (tsc, unit, E2E, build). All green
   before pushing.
6. **PR to main**: push the branch, `gh pr create --base main`. Title format
   from history: `chore: bump version to X.Y.Z and update CHANGELOG` or
   `release: vX.Y.Z`.
7. **Checks**: `gh pr checks <n>`. If the PR shows BLOCKED while checks are
   green, the branch-protection required contexts are probably wrong — they
   must be bare job names (e.g. `Run Tests`), not
   `PR Quality Check / Run Tests`. Inspect with
   `gh api repos/{owner}/{repo}/branches/main/protection/required_status_checks`.
8. **Merge** with a merge commit (rule above). Wait for user approval first.
9. **Tag/release**: `gh release create vX.Y.Z` with notes from the CHANGELOG.
10. **Sync back**: branch `chore/sync-main-vX.Y.Z` from main, PR into develop,
    merge commit again. Confirm `git log develop..main` is empty afterwards.

## Hotfixes

`hotfix/*` branches come from `main`, PR back to `main`, then sync into
develop the same way. Everything else above still applies.
