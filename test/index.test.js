import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, join } from 'node:path'
import { after, before, test } from 'node:test'

import config from '../src/index.js'

const eslintTask = config['*.{js,cjs,mjs,jsx,ts,mts,tsx}']
const originalCwd = process.cwd()
let directory
let active
let ignored

before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'lint-staged-test-'))
  active = join(directory, 'active file.js')
  ignored = join(directory, 'ignored.js')
  await writeFile(
    join(directory, 'eslint.config.cjs'),
    "module.exports = [{ ignores: ['ignored.js'] }, { rules: { 'prefer-const': 'error' } }]\n",
  )
  await writeFile(active, 'const active = 1\n')
  await writeFile(ignored, 'const ignored = 1\n')
  process.chdir(directory)
})

after(async () => {
  process.chdir(originalCwd)
  await rm(directory, { recursive: true, force: true })
})

test('ESLint fixes active staged files with quoted paths', async () => {
  assert.equal(await eslintTask([active]), `eslint --fix "${active}"`)
})

test('ESLint excludes ignored paths from mixed staged files', async () => {
  assert.equal(await eslintTask([ignored, active]), `eslint --fix "${active}"`)
})

test('ESLint skips an empty staged file list', async () => {
  assert.deepEqual(await eslintTask([]), [])
})

test('ESLint skips ignored staged files without fixing unstaged files', async () => {
  const unstaged = join(directory, 'unstaged.js')
  const contents = 'let value = 1\nconsole.log(value)\n'
  await writeFile(unstaged, contents)

  const tasks = await eslintTask([ignored])
  for (const command of [tasks].flat()) {
    execSync(command, {
      env: {
        ...process.env,
        PATH: [join(originalCwd, 'node_modules/.bin'), process.env.PATH].join(
          delimiter,
        ),
      },
    })
  }

  assert.equal(await readFile(unstaged, 'utf8'), contents)
  assert.deepEqual(tasks, [])
})
