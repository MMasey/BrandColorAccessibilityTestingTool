# GitHub Configuration

This directory contains GitHub-specific configuration files for Copilot, workflows, and automation.

## Copilot Coding Agent Configuration

### Repository-Wide Instructions
**File**: `copilot-instructions.md`

Contains comprehensive guidelines for working with this codebase, including:
- Project overview and tech stack
- Development commands
- Coding conventions (TypeScript, Lit, file naming, code style)
- Git workflow and commit message conventions
- Testing guidelines
- Accessibility requirements

This file is automatically used by GitHub Copilot coding agent, Copilot Chat, and Copilot code review.

### Setup Steps
**File**: `copilot-setup-steps.yml`

Defines automated setup steps for Copilot coding agent's development environment:
- Installs npm dependencies with `npm ci`
- Installs Playwright browsers for E2E testing

This ensures Copilot can build, test, and validate changes in its own environment before creating pull requests.

### Path-Specific Instructions
**Directory**: `instructions/`

Contains specialized instructions that apply to specific file types:

- `playwright-tests.instructions.md` - Guidelines for E2E tests (`e2e/**/*.spec.ts`)
- `unit-tests.instructions.md` - Guidelines for unit tests (`**/*.test.ts`)

These instructions are automatically applied when Copilot works on matching file types.

### Custom Agents
**Directory**: `agents/`

Contains custom agent profiles for specialized tasks:

- `test-specialist.agent.md` - A testing specialist agent focused on writing and improving tests

Custom agents can be invoked explicitly when assigning tasks to Copilot for domain-specific work.

## GitHub Actions Workflows
**Directory**: `workflows/`

- `deploy-github-pages.yml` - Deploys the application to GitHub Pages
- `pr-quality-check.yml` - Runs quality checks on pull requests (tests, builds, linting)

## Additional Documentation

- **Repository Root**:
  - `CLAUDE.md` - High-level architecture and roadmap overview
  - `CONTRIBUTING.md` - Contribution guidelines
  - `README.md` - Project readme

- **Specifications**: `spec/` - Feature specifications and roadmap documentation

## How These Files Work Together

1. **Copilot Assignment**: When Copilot coding agent is assigned a task via GitHub Issues
2. **Environment Setup**: `copilot-setup-steps.yml` prepares the development environment
3. **General Guidelines**: `copilot-instructions.md` provides overall coding standards
4. **Specific Guidelines**: Files in `instructions/` provide targeted guidance for specific file types
5. **Specialized Agents**: Agents in `agents/` can be invoked for domain-specific expertise
6. **Validation**: Copilot uses the setup environment to build, test, and validate changes
7. **Pull Request**: Copilot creates a PR with the changes
8. **CI/CD**: GitHub Actions workflows in `workflows/` validate the PR

## References

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Custom Agents Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [Repository Custom Instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
