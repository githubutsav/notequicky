# Commands and Keyboard Shortcuts

This is a macOS-first quick reference for everyday development. `⌘` is Command, `⌥` is Option, `⌃` is Control, and `⇧` is Shift. Windows/Linux alternatives use `Ctrl`, `Alt`, and `Shift`.

## Safety Legend

```text
Read-only       Inspects data without changing files or installed packages.
Writes files    Creates, edits, formats, or builds files.
Changes deps    Installs, removes, or updates dependencies.
Destructive     Can discard data or history; inspect the target first.
```

## 1. Terminal Navigation and Files

```sh
pwd                    # Read-only: print current folder
ls                     # Read-only: list visible files
ls -la                 # Read-only: include hidden files and details
cd path/to/folder      # Move into a folder
cd ..                  # Move to parent folder
mkdir project          # Writes files: create a folder
touch notes.md         # Writes files: create a file if absent
cp source.md copy.md   # Writes files: copy a file
mv old.md new.md       # Writes files: rename or move a file
open .                 # macOS: open current folder in Finder
code .                 # Open current folder in VS Code (requires `code` command setup)
```

Use `rg` (ripgrep) for fast searching.

```sh
rg "search text"              # Read-only: search file contents recursively
rg -n "TODO" javascript.md    # Read-only: include line numbers
rg --files -g '*.md'           # Read-only: list Markdown files
find . -maxdepth 2 -type f     # Read-only: basic file search when needed
```

Avoid `rm` until you have checked the exact path with `pwd` and `ls`. Prefer moving an unwanted file to Trash from Finder when recovery matters.

```sh
rm file.md               # Destructive: permanently removes one file
rm -r folder             # Destructive: permanently removes a folder and contents
```

## 2. Terminal Keyboard Shortcuts

```text
⌃C                    Stop the running foreground command.
⌃D                    Send end-of-input; may exit the current shell.
⌃L or ⌘K              Clear the terminal display (shell/terminal dependent).
⌃A / ⌃E               Move to the start / end of the command line.
⌥← / ⌥→               Move one word left / right in many macOS terminals.
⌃U                    Delete from cursor to start of line.
⌃K                    Delete from cursor to end of line.
↑ / ↓                 Previous / next command from history.
Tab                   Complete a command, file, or folder name.
```

## 3. Git Commands

```sh
git status              # Read-only: changed, staged, and untracked files
git diff                # Read-only: unstaged changes
git diff --staged       # Read-only: staged changes
git log --oneline -10   # Read-only: recent concise commits
git branch --show-current # Read-only: current branch
git add file.md         # Writes Git index: stage one file
git add -p              # Writes Git index: choose changes interactively
git commit -m "message" # Writes Git history: create a commit
git switch branch-name  # Changes working tree to another branch
git switch -c feature/name # Creates and switches to a new branch
git pull --ff-only      # Downloads and fast-forwards; refuses a merge commit
git push                # Sends local commits to configured remote
```

Inspect before undoing. These commands can discard work:

```sh
git restore file.md             # Destructive: discard unstaged changes to a file
git restore --staged file.md    # Changes index: unstage a file, keeps edits
git clean -n                    # Read-only: preview untracked files that would be removed
git clean -fd                   # Destructive: remove untracked files and folders
```

## 4. Node, npm, and TypeScript

```sh
node --version             # Read-only: Node version
npm --version              # Read-only: npm version
npm run                    # Read-only: list package scripts
npm install                # Changes deps: install from package.json
npm ci                     # Changes deps: recreate node_modules from package-lock.json
npm install package-name   # Changes deps: add a runtime dependency
npm install -D package-name # Changes deps: add a development dependency
npm uninstall package-name # Changes deps: remove a dependency
npm test                   # Run the project's test script
npm run lint               # Run the project's linter, if configured
npm run format             # Writes files if the formatter is configured to fix
npm run build              # Writes build output
npm outdated               # Read-only: show available package updates
npm audit                  # Read-only: report known dependency vulnerabilities
npx tsc --noEmit           # Read-only: type-check without JavaScript output
```

Check the project scripts in `package.json`; `npm run dev`, `npm test`, and `npm run build` are conventions, not guaranteed names. Review changes after dependency updates with `git diff package.json package-lock.json`.

## 5. React, Vite, and Frontend App Commands

React's official docs recommend starting production apps with a framework when routing, server rendering, data loading, or deployment conventions matter. For learning React or building a client-side app from scratch, Vite is a common lightweight starting point.

```sh
npm create vite@latest my-react-app -- --template react-ts # Writes files: scaffold React + TypeScript app
cd my-react-app                                           # Move into the new project
npm install                                               # Changes deps: install project dependencies
npm run dev                                               # Start local dev server
npm run build                                             # Writes files: create production build, usually dist/
npm run preview                                           # Preview the production build locally
npm create vite@latest . -- --template react-ts           # Writes files in current folder; use only in the intended directory
```

Common React framework starters:

```sh
npx create-next-app@latest my-next-app                    # Writes files/changes deps: create Next.js app
npx create-react-router@latest my-router-app              # Writes files/changes deps: create React Router framework app
```

Common frontend dependencies:

```sh
npm install react-router                                  # Changes deps: add React Router to an existing React app
npm install @tanstack/react-query                         # Changes deps: add server-state caching library
npm install react-hook-form zod                           # Changes deps: add form handling and runtime validation
npm install -D vitest @testing-library/react @testing-library/user-event jsdom # Changes dev deps: component testing stack
```

Before adding a library, check whether the project already uses a router, form library, data-fetching library, or test runner. Do not mix multiple tools for the same job without a clear reason. For app setup, see [Creating a React App](https://react.dev/learn/creating-a-react-app), [Build a React App from Scratch](https://react.dev/learn/build-a-react-app-from-scratch), and the [Vite guide](https://vite.dev/guide/).

## 6. Frontend Testing Commands

Run these from the project root. Prefer existing `package.json` scripts when a project already defines them.

```sh
npm install -D vitest                                      # Changes dev deps: add Vitest
npm install -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom # Changes dev deps: DOM component test stack
npm install -D msw                                         # Changes dev deps: API mocking
npm test                                                   # Run configured test script
npm run test                                               # Run configured test script when named test
npx vitest                                                 # Run Vitest directly
npx vitest run                                             # Run Vitest once for CI-style checks
npx vitest --ui                                            # Start Vitest UI if installed/configured
npm init playwright@latest                                 # Writes files/changes dev deps: add Playwright
npx playwright test                                        # Run Playwright tests
npx playwright test --ui                                   # Open Playwright interactive UI
npx playwright test --headed                               # Run browser tests visibly for debugging
npx playwright show-report                                 # Open Playwright HTML report
npm create storybook@latest                                # Writes files/changes dev deps: add Storybook
npm run storybook                                          # Start Storybook when configured
npm run build-storybook                                    # Build static Storybook when configured
npx storybook@latest add @chromatic-com/storybook          # Writes config/changes dev deps: add visual tests addon
npm install -D @axe-core/playwright                        # Changes dev deps: axe accessibility checks in Playwright
```

Do not point tests at production services or real secrets. Use test databases, seeded fixtures, MSW handlers, and local/dev credentials. See `frontend-testing.md` for the testing workflow.

## 7. Next.js Auth Commands

Run these from the project root. Check the project's auth library and version before copying setup commands.

```sh
npm install next-auth@beta                                # Changes deps: Auth.js/NextAuth for App Router examples
openssl rand -base64 32                                   # Generates AUTH_SECRET; do not commit the value
npm install zod bcrypt                                    # Changes deps: validation and password hashing
npm install -D @types/bcrypt                              # Changes dev deps: bcrypt TypeScript declarations when needed
npm install jose                                          # Changes deps: custom encrypted/signed session tokens
npm install @auth/prisma-adapter                          # Changes deps: Auth.js Prisma adapter for database-backed auth
```

Never commit `.env` secrets. Do not prefix server secrets with `NEXT_PUBLIC_`. See `nextjs-auth.md` for session, cookie, CSRF, and authorization guidance.

## 8. Prisma Commands

Run Prisma from the project folder and make sure `DATABASE_URL` targets the intended database before any database-changing command. Use the Prisma version installed by the project with `npx prisma`.

```sh
npx prisma version                         # Read-only: CLI, client, engine, and platform versions
npx prisma validate                        # Read-only: validate Prisma schema
npx prisma format --check                  # Read-only: fail if schema is not formatted
npx prisma format                          # Writes schema: format prisma/schema.prisma
npx prisma generate                        # Writes generated Prisma Client artifacts
npx prisma studio                          # Starts local browser database editor; changes data only if you edit it
npx prisma migrate status                  # Read-only: compare migration files with migration history
npx prisma migrate dev --name add_status   # Dev only: create and apply a migration
npx prisma migrate dev --create-only --name add_status # Dev only: create migration for SQL review
npx prisma migrate deploy                  # Applies existing migrations; staging/production release step
npx prisma db seed                         # Writes database data using configured seed command
npx prisma db pull --print                 # Read-only: preview schema introspection from an existing database
npx prisma db pull                         # Writes schema: overwrite schema from existing database; commit first
```

Commands requiring extra care:

```sh
npx prisma db push                         # Changes database without migration files; prototype/local use only
npx prisma db push --accept-data-loss       # Destructive: accepts warned data loss
npx prisma migrate reset                    # Destructive: resets development database and reapplies migrations
npx prisma migrate resolve --applied migration_name # Changes migration history; only after incident investigation
npx prisma migrate diff --help              # Read-only: view version-specific schema-diff source options
npx prisma db execute --file ./script.sql  # Writes database: run reviewed SQL outside migration history
```

`migrate dev` is for development; use `migrate deploy` for committed migrations in staging or production. Recent Prisma versions require running `prisma generate` explicitly after `migrate dev` or `db push`; check the installed project's major-version documentation before relying on automation. `db pull` rewrites the schema, so commit or back it up first. See [Prisma CLI reference](https://www.prisma.io/docs/orm/reference/prisma-cli-reference) and `Prisma.md` for the full migration workflow.

## 9. VS Code: Everyday Editing

| Action | macOS | Windows/Linux |
| --- | --- | --- |
| Command Palette | `⇧⌘P` | `Ctrl+Shift+P` |
| Quick Open file | `⌘P` | `Ctrl+P` |
| New file | `⌘N` | `Ctrl+N` |
| Save | `⌘S` | `Ctrl+S` |
| Save all | `⌥⌘S` | `Ctrl+K S` |
| Close editor | `⌘W` | `Ctrl+W` |
| Toggle terminal | ``⌃` `` | ``Ctrl+` `` |
| Toggle line comment | `⌘/` | `Ctrl+/` |
| Format document | `⇧⌥F` | `Shift+Alt+F` |
| Show code actions | `⌘.` | `Ctrl+.` |
| Rename symbol | `F2` | `F2` |
| Go to definition | `F12` | `F12` |
| Find references | `⇧F12` | `Shift+F12` |
| Multi-cursor: next match | `⌘D` | `Ctrl+D` |
| Select all matches | `⇧⌘L` | `Ctrl+Shift+L` |
| Move line up/down | `⌥↑` / `⌥↓` | `Alt+↑` / `Alt+↓` |
| Copy line up/down | `⇧⌥↑` / `⇧⌥↓` | `Shift+Alt+↑` / `Shift+Alt+↓` |

## 10. VS Code: Search, Navigation, and Views

| Action | macOS | Windows/Linux |
| --- | --- | --- |
| Find in file | `⌘F` | `Ctrl+F` |
| Replace in file | `⌥⌘F` | `Ctrl+H` |
| Search workspace | `⇧⌘F` | `Ctrl+Shift+F` |
| Go to line | `⌃G` | `Ctrl+G` |
| Go back / forward | `⌃-` / `⌃⇧-` | `Alt+Left` / `Alt+Right` |
| Explorer | `⇧⌘E` | `Ctrl+Shift+E` |
| Source Control | `⌃⇧G` | `Ctrl+Shift+G` |
| Run and Debug | `⇧⌘D` | `Ctrl+Shift+D` |
| Extensions | `⇧⌘X` | `Ctrl+Shift+X` |
| Split editor | `⌘\\` | `Ctrl+\\` |
| Keyboard shortcuts editor | `⌘K ⌘S` | `Ctrl+K Ctrl+S` |

## 11. VS Code: Debugging and Markdown

| Action | macOS | Windows/Linux |
| --- | --- | --- |
| Start/continue debugging | `F5` | `F5` |
| Step over | `F10` | `F10` |
| Step into | `F11` | `F11` |
| Stop debugging | `⇧F5` | `Shift+F5` |
| Toggle breakpoint | `F9` | `F9` |
| Markdown preview | `⇧⌘V` | `Ctrl+Shift+V` |
| Preview beside | `⌘K V` | `Ctrl+K V` |

Keyboard layouts, extensions, and personal keybindings can change these defaults. Open the Keyboard Shortcuts editor to search for a command, see conflicts, or customize a binding. VS Code maintains custom bindings in `keybindings.json`. [Official VS Code keybindings documentation](https://code.visualstudio.com/docs/configure/keybindings) is the current source of truth.

## 12. Useful Project Checks

```sh
git status                 # Read-only: verify intended changes
git diff --check           # Read-only: detect whitespace errors
rg 'TODO|FIXME'            # Read-only: find follow-up work
node --test                # Run Node built-in tests when applicable
npx tsc --noEmit           # Type-check TypeScript when applicable
npx prisma validate         # Validate Prisma schema when applicable
npx prisma migrate status   # Check migration state before a release
npm run lint               # Run configured lint checks
npm test                   # Run configured test suite
npx vitest run             # Run Vitest once when configured
npx playwright test         # Run Playwright browser tests when configured
npm run build-storybook     # Build Storybook when configured
npm run build              # Build before release when configured
npm run preview            # Preview production frontend build when configured
```

Run the checks that exist in the current project, then inspect `git diff` before committing. Do not treat a successful build as proof that authorization, runtime validation, migrations, auth cookies, CSRF protections, or deployment settings are safe.
