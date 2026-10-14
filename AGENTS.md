# Agents orientation — `langri-sha/lint-staged`

`@langri-sha/lint-staged` is a shared lint-staged config that runs ESLint and
Prettier over staged files before each commit, skipping the files either tool
ignores. The package is the repository root.

## Who owns which file

Projen writes `package.json` and every file listed in `.projen/files.json`; they
are read-only. Change them in `.projenrc.ts`, then run `pnpm exec projen`.
Beachball owns `CHANGELOG.md`, `CHANGELOG.json` and the `version` field.
Everything else — `src/`, `test/`, `readme.md`, `.github/workflows/` and this
file — is edited by hand. Repository settings, branch protection and the Actions
secrets are managed by `langri-sha/github-repos`.

## Common tasks

```sh
pnpm install
pnpm exec projen                        # re-synthesize from .projenrc.ts
node --test test/*.test.js              # regression tests
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
pnpm change                             # write a change file
```

Regression tests use the Node.js test runner and run in the Workspace workflow.

## Its own config

`lint-staged.config.js` extends `./src/index.js`, not the last release on npm,
so the pre-commit hook runs the working tree's config and a change to `src/` is
exercised by the commit that makes it. A `src/index.js` that fails to load
breaks the hook with it. The ESLint and Prettier configs come from npm, pinned
like any other dependency.

## Dependencies

`eslint`, `lint-staged` and `prettier` are peers, with `eslint` and `prettier`
optional, exactly as published. The preset installs all three as root
devDependencies at their current releases, and `pinnedDevDependency` is off, so
projen does not also pin each peer at the bottom of its range.

## Release

Beachball versions the package. Anything that reaches the tarball or builds it —
`src/`, `readme.md`, `package.json`, `tsconfig.build.json` — needs a change file
in the same pull request: run `pnpm change`. Use `none` for edits that shouldn't
cut a release on their own, such as readme-only changes. Root tooling is exempt;
`beachball.config.cjs` lists it, so lock file maintenance never cuts a release.
On Renovate pull requests that touch the package, CI writes a `patch` change
file itself.

Nothing publishes on merge. Run the Release workflow (`publish.yml`) from the
Actions tab to publish the pending change files through npm trusted publishing.
It tags the version `v<version>` and creates a GitHub release with generated
notes; a tag that already has a release is skipped, so the workflow is safe to
rerun. Beachball's own `gitTags` stays off, since it would name the tags
`@langri-sha/lint-staged_v<version>`.

`main` points at `src/index.js` in the repository, and `publishConfig` points
`main` and `types` at `dist/`, which `prepublishOnly` builds. The tarball ships
`src/` beside `dist/`, which the declaration maps point into.

There is deliberately no `engines` field. Published from the root, it would bind
consumers to the Node.js release this repository is developed on, so that lives
in `devEngines`, where `actions/setup-node` reads it.
