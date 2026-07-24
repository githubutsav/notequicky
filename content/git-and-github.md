# Git and GitHub Learning Notes

Git records project history locally. GitHub hosts Git repositories and adds collaboration tools: pull requests, issues, reviews, actions, releases, security settings, and project management.

```text
working tree -> staging area -> local commit -> remote branch -> pull request -> review/CI -> protected main -> release
```

Use Git to make changes recoverable. Use GitHub to make changes reviewable, discussable, and safe to ship.

## 1. Setup and Repository Mental Model

Configure your author identity once. Use a real email address associated with the Git host account or GitHub's privacy-preserving noreply address.

```sh
git config --global user.name "Your Name"       # Writes global Git identity
git config --global user.email "you@example.com" # Writes global Git identity
git config --global init.defaultBranch main      # New repositories start on main
git config --global pull.ff only                 # Refuse accidental merge commits from git pull
git config --global --list                       # Read-only: inspect global settings
```

The three local states matter:

```text
Working tree  Files you are editing now.
Staging area  Exact changes selected for the next commit.
Commit        A permanent local history snapshot with a parent commit.
```

```sh
git init                         # Writes .git history in the current folder
git clone https://github.com/org/project.git # Copies a remote repository locally
git status                       # Read-only: current branch and changes
git log --oneline --graph -15    # Read-only: concise branch history
git show HEAD                    # Read-only: current commit and patch
```

Never commit `.env`, credentials, private keys, database dumps, or generated secrets. Add a safe `.env.example` with placeholder names instead.

## 2. Everyday Change Workflow

Make small, coherent commits. A commit should explain one logical change and leave the project in a working state.

```sh
git switch main                  # Move to main
git pull --ff-only               # Download and fast-forward main
git switch -c feat/todo-priority # Create and switch to a feature branch

# Edit files and run relevant checks.
git status                       # Read-only: inspect exact changes
git diff                         # Read-only: inspect unstaged changes
git add src/todo.ts              # Stage one file
git add -p                       # Stage selected hunks interactively
git diff --staged                # Read-only: inspect the future commit
git commit -m "Add todo priority" # Write a local commit
git push -u origin feat/todo-priority # Publish branch and remember upstream
```

Use imperative commit subjects: `Add validation`, `Fix token expiry`, `Document migration flow`. Explain why in the body when the intent is not obvious.

```sh
git commit -m "Add todo priority" -m "Expose a safe default for existing records."
git commit --amend               # Rewrites latest unpushed commit; inspect first
git commit --amend --no-edit     # Add staged changes to latest unpushed commit
```

Do not amend or rebase a branch after others have based work on it unless the team has agreed and you communicate the force-push.

## 3. Branches, Remotes, and Synchronization

`origin` normally points to the repository you cloned. In a fork workflow, `origin` is your fork and `upstream` is the project you contribute to.

```sh
git branch --show-current         # Read-only: current branch
git branch -vv                    # Read-only: branches and tracking remotes
git fetch origin                  # Download remote refs; does not change files
git fetch --prune origin          # Also remove stale remote-tracking refs
git switch branch-name            # Switch to an existing local branch
git switch -c fix/login-error     # Create a branch from current commit
git push -u origin branch-name    # Publish a new branch
git remote -v                     # Read-only: remote names and URLs
git remote add upstream URL        # Add source project remote for a fork
```

Before updating a feature branch, download the latest base branch and use the team’s chosen strategy:

```sh
git fetch origin
git merge origin/main             # Adds a merge commit when histories diverge
git rebase origin/main            # Replays your unmerged commits on current main
```

Merge preserves the exact history. Rebase creates new commit IDs for the rebased commits and produces a linear history. Do not rebase shared branches without agreement. After rebasing a branch you own, use the safer force push:

```sh
git push --force-with-lease       # Rewrites remote branch only if it has not moved unexpectedly
```

## 4. Pull Requests and GitHub CLI

A pull request (PR) proposes a branch for merging into a base branch. It is the unit of collaboration: the description, code diff, tests, review, and CI should make the change safe to understand and merge.

```sh
gh auth login                     # Connect GitHub CLI to your account
gh repo view --web                # Open repository in browser
gh pr create --fill               # Create PR from current branch using commit details
gh pr status                      # Read-only: your open/review-requested PRs
gh pr view --web                  # Open current PR in browser
gh pr checks                      # Read-only: CI/check status for current PR
gh pr checkout 123                # Check out PR number 123 locally
gh pr review --approve            # Submit approval only after reviewing carefully
```

Good PR descriptions answer:

- What changed and why?
- How can a reviewer test it?
- What risks, migrations, flags, follow-ups, or rollout steps exist?
- Which screenshots, logs, or API examples prove user-visible behavior?

Keep PRs focused. Split unrelated refactors, formatting churn, dependency upgrades, and feature work where possible. Open a draft PR early when you want architecture feedback but the change is not ready to merge.

## 5. Reviewing Code Well

Review for correctness, security, maintainability, tests, and operational impact—not personal style preferences already handled by formatting tools.

```text
Author: describe intent, scope, test evidence, risks, and follow-up work.
Reviewer: understand the requirement first; inspect the diff and surrounding code; run or reason through tests.
Comment: explain the concern and its consequence; label blocking issues clearly; suggest an alternative when useful.
Author: respond to every thread, make changes, test again, and re-request review after substantial updates.
```

Use these review outcomes precisely:

```text
Comment          Non-blocking question, note, or suggestion.
Approve          Safe to merge at the reviewed revision.
Request changes  A blocking issue must be resolved before merge.
```

Large changes need a design document or issue first. Review the design before implementation, then keep the code PR narrow enough to review effectively.

## 6. How Teams Collaborate

A healthy team makes work visible and decisions reproducible.

```text
Issue / ticket
  -> owner writes a short problem statement and acceptance criteria
  -> team discusses design, risks, data changes, and rollout
  -> small feature branch and draft PR
  -> automated checks + peer/code-owner review
  -> merge to protected main
  -> controlled deploy, monitoring, and rollback plan
  -> close issue with result and follow-up tasks
```

Useful team habits:

- Break work into independently reviewable slices; avoid long-lived branches.
- Synchronize early when two people touch the same area; agree on interfaces and ownership before both code deeply.
- Prefer written decisions in issues, PRs, ADRs, or docs so time zones and future teammates are not blocked.
- Raise uncertainty, security concerns, and production risk early. Escalation is a strength, not a failure.
- Pair or mob on difficult design, incidents, onboarding, or high-risk migrations; do not use it for every routine task.
- Rotate reviews and document systems so one person is not a permanent bottleneck.
- Treat production incidents as learning opportunities: record timeline, cause, remediation, and prevention without blame.

## 7. Large-Team Repository Practices

Large teams need rules that protect `main` without blocking normal delivery.

### Protected Branches and Rulesets

For `main` and release branches, require:

- Pull requests rather than direct pushes.
- Passing CI checks: install, lint, type-check, tests, build, and relevant security scans.
- At least one appropriate approval; two for high-risk areas when capacity allows.
- Resolved review conversations and fresh approval after meaningful changes.
- Restricted force-pushes and deletion.
- A merge queue when many PRs contend for the same branch.

### Code Ownership

`CODEOWNERS` assigns a person or team to paths. GitHub can request them automatically and can require their approval for owned files.

```text
# .github/CODEOWNERS
/.github/                 @acme/platform
/prisma/                  @acme/database
/apps/api/auth/           @acme/security
/apps/web/                @acme/frontend
```

Ownership means accountability for review quality and system knowledge, not exclusive permission to make changes. Protect the `CODEOWNERS` file itself so ownership cannot be silently removed in a PR.

### Monorepos and Service Boundaries

In a monorepo, keep package ownership, public APIs, test commands, build boundaries, and deployment responsibilities explicit. Changes that span services should state compatibility, migration order, feature flags, rollback behavior, and owners in the PR.

Avoid coupling every package through shared internal utilities. Shared code is a product: version it, document it, test it, and give it owners.

## 8. Conflict Resolution and Recovery

Conflicts are normal when independent changes touch the same lines. Read both intentions before choosing a resolution.

```sh
git status                       # Read-only: conflicting files and operation state
# Edit conflict markers, then test the result.
git add resolved-file.ts
git merge --continue             # Finish a merge after resolving
git rebase --continue            # Continue a rebase after resolving
git merge --abort                # Return working tree to state before merge
git rebase --abort               # Return working tree to state before rebase
```

Recoverable operations:

```sh
git restore file.md              # Destructive: discard unstaged edits in one file
git restore --staged file.md     # Unstage but preserve working-tree edits
git stash push -m "WIP auth fix" # Save tracked local edits temporarily
git stash list                   # Read-only: list saved stashes
git stash pop                    # Reapply and remove latest stash; may conflict
git reflog                       # Read-only: find prior local HEAD positions
git revert commit_sha            # Write a new commit that reverses a published commit
```

Be especially careful:

```sh
git reset --hard commit_sha      # Destructive: discard tracked working-tree/index changes
git clean -n                     # Read-only: preview untracked files that would be removed
git clean -fd                    # Destructive: delete untracked files and folders
git push --force                 # Rewrites remote history; prefer --force-with-lease only on your branch
```

Use `git revert` to undo an already shared/merged commit because it preserves public history. Use `git reset` for local, unshared work only. Before destructive commands, run `git status`, inspect the exact target, and consider creating a backup branch.

## 9. Advanced Daily Tools

```sh
git cherry-pick commit_sha       # Apply one existing commit onto current branch; may conflict
git rebase -i origin/main        # Interactively reorder/squash/edit unshared commits
git bisect start                 # Begin binary search for a regression
git blame path/to/file.ts        # Read-only: see commit/author per line; use respectfully
git worktree add ../project-fix fix/urgent-bug # Create a second checkout sharing Git data
git tag -a v1.2.0 -m "Release v1.2.0" # Write annotated release tag
git push origin v1.2.0           # Publish tag
```

Use `cherry-pick` for deliberate backports, not as a substitute for normal merging. Use interactive rebase to clean up a branch before review when the branch is yours alone. `git blame` explains history; it should help understanding, never assign personal blame.

## 10. Releases and Production Changes

Git history should support safe delivery.

```text
Issue/design -> implementation PR -> required review + CI -> merge -> tagged/reproducible build
  -> controlled migration/deploy -> monitor -> rollback or follow-up if needed
```

For production PRs, include:

- Schema/data migration and backward-compatibility plan.
- Feature-flag, rollout, monitoring, and rollback plan.
- Configuration/secret changes without exposing their values.
- Owner and runbook for unusual or high-risk releases.
- Evidence that automated checks and production-like tests passed.

Do not run database migrations from every application replica at startup. Use one controlled release step; see `Prisma.md` for migration specifics. Use release tags and changelogs for deployable versions. Keep emergency fixes small, reviewed when possible, and followed by a retrospective.

## 11. Contributing to Open Source

First read the project’s `README`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, license, development setup, and issue/PR templates. A security issue usually belongs in the private reporting process, not a public issue.

### Fork and Pull Request Workflow

```sh
# After forking in GitHub, clone your fork.
git clone https://github.com/YOUR_USER/project.git
cd project
git remote add upstream https://github.com/ORIGINAL_OWNER/project.git
git fetch upstream
git switch -c docs/improve-installation upstream/main

# Make a focused change; run the repository's checks.
git add docs/installation.md
git commit -m "Improve installation instructions"
git push -u origin docs/improve-installation
gh pr create --repo ORIGINAL_OWNER/project --base main --head YOUR_USER:docs/improve-installation
```

Keep a fork current without changing the upstream project:

```sh
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
```

Good first contributions are documentation corrections, reproduction cases, tests for confirmed bugs, small accessible fixes, or issues already labelled `good first issue`/`help wanted`. Do not start a large feature without discussing it in an issue or project channel first.

### Open-Source Contribution Checklist

- [ ] I followed the repository's local setup, style, tests, and contribution rules.
- [ ] The issue is not already fixed, assigned, or intentionally declined.
- [ ] My branch and PR solve one scoped problem.
- [ ] I included tests or explained why tests are not applicable.
- [ ] I did not expose secrets, private data, generated lockfile churn, or unrelated formatting changes.
- [ ] I responded kindly to feedback and updated the PR without force-pushing over others' work.
- [ ] I understand the license and contributor-license-agreement policy, if any.

## 12. Useful GitHub Repository Files

```text
README.md                    What the project is, setup, commands, architecture overview.
CONTRIBUTING.md              How to propose, test, and submit changes.
CODE_OF_CONDUCT.md           Community behavior expectations.
SECURITY.md                  Supported versions and private vulnerability reporting path.
LICENSE                      Reuse and contribution terms.
.github/pull_request_template.md  PR questions/checklist.
.github/ISSUE_TEMPLATE/      Structured bug report/feature request forms.
.github/CODEOWNERS           Path-based review ownership.
.github/workflows/           GitHub Actions CI/CD automation.
```

An effective PR template asks for the problem, implementation, tests, screenshots/API evidence, migration or rollout plan, risk, and checklist. Do not make templates so long that authors answer them mechanically.

## 13. Security and Access

Use least privilege: people and automation should have only the access they need. Require two-factor authentication, protect organization owners, use short-lived credentials where possible, and rotate secrets after suspected exposure.

```sh
git log -S "secret text" --all  # Read-only: find a string's history; do not paste real secrets in shell history
git grep "API_KEY"              # Read-only: scan tracked files for a pattern
```

If a secret reaches any Git history, treat it as compromised: revoke/rotate it immediately, assess access, and follow the project’s incident process. Rewriting history may reduce accidental exposure but does not make a leaked secret safe again.

## 14. Where to Practice Git and GitHub

Start with visual practice, then use a throwaway repository, then make real GitHub pull requests. Do not practise destructive commands in a project that matters.

| Resource | Best for | Start with |
| --- | --- | --- |
| [Learn Git Branching](https://learngitbranching.js.org/) | Visual, interactive Git practice in the browser. | Introduction sequence, then remote, rebase, and advanced levels. |
| [GitHub Skills](https://github.com/skills) | Guided, hands-on GitHub exercises using real Issues, Actions, and pull requests. | A beginner GitHub course, then pull-request review and merge-conflict courses. |
| [GitHub Hello World](https://docs.github.com/en/get-started/start-your-journey/hello-world) | Your first repository, branch, commit, and pull request in a safe guided tutorial. | Complete it once without using the terminal, then repeat with Git locally. |
| [octocat/Spoon-Knife](https://github.com/octocat/Spoon-Knife) | A public practice repository for the fork-and-pull-request workflow. | Fork it, edit a file in your fork, and open a practice PR. |

### Your Safe Local Playground

Create a throwaway repository outside your real projects and deliberately practise normal mistakes and recovery:

```sh
mkdir git-playground && cd git-playground         # Writes a practice folder in your chosen safe location
git init                                          # Writes local Git history
git switch -c practice/main
printf 'first note\n' > notes.txt                 # Writes a practice file
git add notes.txt && git commit -m "Add first note"

git switch -c practice/feature
printf 'feature change\n' >> notes.txt
git commit -am "Change note on feature branch"
git switch practice/main
printf 'main change\n' >> notes.txt
git commit -am "Change note on main"
git merge practice/feature                        # Practise resolving the expected conflict
```

After that, practise `git restore`, `git revert`, `git stash`, `git rebase --abort`, `git reflog`, a pull request, review comments, and a merge. A mistake in this folder is a successful lesson.

### Two-Week Practice Path

```text
Days 1-2: Learn Git Branching basics; create and inspect local commits.
Days 3-4: Branch, merge, resolve a conflict, stash work, and use restore/revert.
Days 5-6: Finish GitHub Hello World; create a PR from your own repository.
Days 7-9: Complete GitHub Skills exercises for PRs, reviews, and conflicts.
Days 10-11: Fork Spoon-Knife; configure upstream; sync your fork; make a practice PR.
Days 12-14: Add CI, a PR template, branch protection, and CODEOWNERS to a small sample project.
```

## 15. Learning Order

```text
1. Create a repository; make, inspect, and revert a small commit.
2. Use a feature branch, pull request, review, and merge with a friend.
3. Practice a merge conflict in a throwaway repository.
4. Add CI, branch protection, PR template, and CODEOWNERS to a sample project.
5. Fork a documentation project and submit a small open-source pull request.
6. Study one production repo from libraries.md: trace one feature from issue to PR to tests.
7. Practise a release: tag, build, migration plan, deploy checklist, and rollback exercise.
```

## Resources and Repositories

- [Git documentation](https://git-scm.com/doc): authoritative command and conceptual reference.
- [Git cheat sheet](https://git-scm.com/cheat-sheet.pdf): concise command reference.
- [GitHub Docs: pull request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews): review workflow and outcomes.
- [GitHub Docs: protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): merge protections and required checks.
- [GitHub Docs: CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners): path ownership and automatic review requests.
- [GitHub Docs: contributing to a project](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project): fork-and-pull-request workflow.
- [Dub](https://github.com/dubinc/dub), [Formbricks](https://github.com/formbricks/formbricks), and [Prisma examples](https://github.com/prisma/prisma-examples): real repositories to study alongside this note.
- [Commands and Keyboard Shortcuts](command.md): compact Git and terminal reference.
