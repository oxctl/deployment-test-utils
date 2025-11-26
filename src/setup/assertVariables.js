import { test, expect } from '@playwright/test'
import 'dotenv/config'

/**
 * List of environment variables required for tests to run.
 * @type {string[]}
 */
const REQUIRED = ['CANVAS_HOST', 'OAUTH_TOKEN', 'TEST_PATH']


// Normalise environment variables at module load time
/**
 * Trim and normalise `CANVAS_HOST` by removing trailing slashes.
 * Stored back into `process.env` for downstream fixtures.
 */
if (process.env.CANVAS_HOST) {
  process.env.CANVAS_HOST = process.env.CANVAS_HOST.trim().replace(/\/+$/g, '')
}

/**
 * Trim and normalise `TEST_PATH` by removing leading slashes.
 * Stored back into `process.env` for downstream fixtures.
 */
if (process.env.TEST_PATH) {
  process.env.TEST_PATH = process.env.TEST_PATH.trim().replace(/^\/+/, '')
}

/**
 * Simple smoke test asserting required env vars are present.
 * Tests will fail with a helpful message if any required variable is missing.
 */
test('required environment variables are set', async () => {
  for (const key of REQUIRED) {
    expect(process.env[key], `Missing required env var: ${key}`).toBeTruthy()
  }
})
