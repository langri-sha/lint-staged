import { Project, TypeScriptConfig } from '@langri-sha/projen-project'

const project = new Project({
  name: '@langri-sha/lint-staged',
  package: {
    authorEmail: 'filip.dupanovic@gmail.com',
    authorName: 'Filip Dupanović',
    authorOrganization: false,
    authorUrl: 'https://langri-sha.com',
    bugsUrl: 'https://github.com/langri-sha/lint-staged/issues',
    copyrightYear: '2021',
    description:
      'Shared lint-staged config that runs ESLint and Prettier before each commit',
    entrypoint: 'src/index.js',
    homepage: 'https://github.com/langri-sha/lint-staged#readme',
    keywords: ['eslint', 'husky', 'lint-staged', 'prettier'],
    license: 'MIT',
    licensed: true,
    minNodeVersion: '24.16.0',
    peerDependencyOptions: {
      pinnedDevDependency: false,
    },
    repository: 'git+https://github.com/langri-sha/lint-staged.git',
    type: 'module',

    devDeps: [
      '@langri-sha/eslint-config@0.9.17',
      '@langri-sha/prettier@0.4.9',
      '@langri-sha/projen-project@*',
      '@langri-sha/tsconfig@1.0.1',
    ],
    peerDeps: ['eslint@^10.4.0', 'lint-staged@^17.0.0', 'prettier@^3.0.0'],
    peerDependenciesMeta: {
      eslint: {
        optional: true,
      },
      prettier: {
        optional: true,
      },
    },
  },
  beachball: {
    config: {
      // The package is the repository root, so these would otherwise demand a
      // release for changes that never reach the tarball.
      ignorePatterns: [
        '.projenrc.ts',
        'AGENTS.md',
        'CODEOWNERS',
        'beachball.config.cjs',
        'eslint.config.js',
        'lint-staged.config.js',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'prettier.config.js',
        'renovate.json5',
        'tsconfig.json',
      ],
    },
  },
  codeowners: {
    '*': '@langri-sha',
  },
  editorConfig: {},
  eslint: {},
  husky: {
    'pre-commit': 'lint-staged',
  },
  lintStaged: {
    // Commit with the working tree's config, not the last release's.
    extends: './src/index.js',
  },
  lintSynthesized: {},
  npmIgnore: {
    ignorePatterns: [
      '/*.config.*',
      '/*.json5',
      '/*.yaml',
      '/AGENTS.md',
      '/CODEOWNERS',
      '/change/',
    ],
  },
  pnpmWorkspace: {
    minimumReleaseAgeExclude: ['@langri-sha/*'],
  },
  prettier: {},
  readme: {
    filename: 'readme.md',
  },
  renovate: {
    packageRules: [
      {
        description: 'Update our own packages together',
        groupName: 'langri-sha projen toolchain',
        groupSlug: 'langri-sha-projen',
        matchPackageNames: ['@langri-sha/**'],
      },
      {
        description: 'Install our own packages without waiting them out',
        matchPackageNames: ['@langri-sha/**'],
        minimumReleaseAge: null,
      },
      {
        description:
          'Install our own GitHub Actions and Terraform modules without waiting them out',
        matchPackageNames: ['langri-sha/**'],
        minimumReleaseAge: null,
      },
    ],
  },
  typeScriptConfig: {
    config: {
      compilerOptions: {
        noEmit: true,
      },
      include: ['src'],
    },
  },
})

project.package?.addField('packageManager', 'pnpm@12.8.1')
project.package?.addField('publishConfig', {
  access: 'public',
  main: 'dist/index.js',
  types: 'dist/index.d.ts',
})

// Published from the root, so `engines` would bind every consumer to the Node.js
// release this repository is developed on. `actions/setup-node` reads the same
// version from `devEngines`, which the registry leaves to the maintainers.
project.package?.file.addDeletionOverride('engines')
project.package?.addField('devEngines', {
  runtime: {
    name: 'node',
    version: `>= ${project.package.minNodeVersion}`,
  },
})

project.package?.setScript(
  'prepublishOnly',
  'rm -rf dist; tsc --project tsconfig.build.json',
)

new TypeScriptConfig(project, {
  fileName: 'tsconfig.build.json',
  config: {
    extends: '@langri-sha/tsconfig/build',
    include: ['src'],
  },
})

project.synth()
