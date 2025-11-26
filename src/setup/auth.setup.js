import { test as setup } from '@playwright/test'
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { grantAccessIfNeeded, login } from '@oxctl/deployment-test-utils'

// Write storage to the consumer repo, not node_modules
/**
 * Path to the serialized Playwright storage state file used by tests.
 * Stored under `playwright/.auth/user.json` in the repository root.
 * @type {string}
 */
const authFile = path.resolve(process.cwd(), 'playwright/.auth/user.json')

/**
 * Raw environment values used for constructing the test URL and auth.
 * These are intentionally read as strings and normalized below.
 * @type {string}
 */
const hostRaw = process.env.CANVAS_HOST || ''
/** @type {string|undefined} OAuth token for test authentication */
const token = process.env.OAUTH_TOKEN
/** @type {string} Path portion for the test URL */
const urlRaw = process.env.TEST_PATH || ''

// Normalize: remove trailing slashes from host, and leading slashes from url
/**
 * Normalized host (no trailing slashes).
 * @type {string}
 */
const host = hostRaw.replace(/\/+$/g, '')
/**
 * Normalized path (no leading slashes).
 * @type {string}
 */
const url = urlRaw.replace(/^\/+/, '')

/**
 * Playwright setup fixture that performs authentication for tests.
 * It ensures a storage state file exists at `playwright/.auth/user.json` by
 * performing a login flow and completing any required grant-access steps.
 *
 * The fixture uses `CANVAS_HOST`, `TEST_PATH` and `OAUTH_TOKEN` from the
 * environment to construct the tool URL and authenticate; these are
 * normalized above.
 *
 * @param {{ context: import('@playwright/test').BrowserContext, page: import('@playwright/test').Page }} fixtures
 * @returns {Promise<void>}
 */
setup('authenticate', async ({ context, page }) => {
  await fs.mkdir(path.dirname(authFile), { recursive: true })

  await login(page.request, page, host, token)
  await grantAccessIfNeeded(page, context, `${host}/${url}`)
  await page.context().storageState({ path: authFile })
})
