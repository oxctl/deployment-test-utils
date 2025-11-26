import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Playwright test runner configuration used by the repository's helper
 * scripts and test runners. This object mirrors the structure expected by
 * Playwright's configuration and is exported so consumer test runners can
 * import and reuse the same configuration.
 *
 * @typedef {import('@playwright/test').PlaywrightTestConfig} PlaywrightTestConfig
 */

/**
 * The exported `config` object for Playwright.
 * - `projects` defines logical test groups used by the helper scripts.
 * - `testDir` values are resolved relative to this file's directory.
 * - The `chromium` project uses the consumer repo working directory and
 *   reads Playwright `storageState` from `playwright/.auth/user.json`.
 *
 * @type {PlaywrightTestConfig}
 */
export const config = {
  projects: [
    {
      name: 'assertVariables',
      testDir: path.resolve(__dirname, 'setup'),
      testMatch: /assertVariables\.js/,
    },
    {
      name: 'setup',
      testDir: path.resolve(__dirname, 'setup'),
      testMatch: /.*\.setup\.js/,
      dependencies: ['assertVariables'],
    },
    {
      name: 'chromium',
      testDir: process.cwd(), // consumer repo
      use: {
        storageState: path.resolve(process.cwd(), 'playwright/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
  ],
  timeout: 60000,
  reporter: [['html', { open: 'never' }]],
  retries: 2,
  use: {
    video: 'on',
    launchOptions: { slowMo: 500 },
  },
}