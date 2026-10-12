import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
