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
pnpm tsc --build .                      # typecheck
pnpm eslint . && pnpm prettier --check .
node --test test/*.test.js               # regression tests
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

Beachball versions the package and the Release workflow publishes it through npm
trusted publishing. Anything that reaches the tarball or builds it — `src/`,
`readme.md`, `package.json`, `tsconfig.build.json` — needs a change file in the
same pull request. Root tooling does not: `beachball.config.cjs` lists what is
exempt, so lock file maintenance never cuts a release.

The Release workflow calls the shared Packages workflow with
`tag-template: v{version}`, which tags each published version, e.g. `v0.9.7`,
and `github-releases: true`, which creates a GitHub release with generated notes
for it. Beachball's own `gitTags` stays off, since it would name the tags
`@langri-sha/lint-staged_v0.9.7`. A tag that already has a release is skipped,
so the workflow is safe to rerun.

`main` points at `src/index.js` in the repository, and `publishConfig` swaps
`main` and `types` for `dist/`, which `prepublishOnly` builds. The tarball ships
`src/` beside `dist/`, which the declaration maps point into.

There is deliberately no `engines` field. Published from the root, it would bind
consumers to the Node.js release this repository is developed on, so that lives
in `devEngines`, where `actions/setup-node` reads it.
