import { expect } from '@playwright/test'

/**
 * Normalized test URL built from environment variables.
 * Uses `CANVAS_HOST` and `TEST_PATH`.
 * Trims whitespace and ensures there is exactly one slash between host and path.
 */
export const TEST_URL = (() => {
  const host = process.env.CANVAS_HOST ? String(process.env.CANVAS_HOST).trim() : ''
  const path = process.env.TEST_PATH ? String(process.env.TEST_PATH).trim() : ''
  if (!host) return ''
  const normalizedHost = host.replace(/\/+$/g, '')
  const normalizedPath = path.replace(/^\/+|\/+$/g, '')
  return normalizedPath ? `${normalizedHost}/${normalizedPath}` : normalizedHost
})()

/**
 * Log in a user by requesting a login endpoint and navigating the page.
 * @param {object} request - Playwright `request` fixture for API calls.
 * @param {import('@playwright/test').Page} page - Playwright `page` instance.
 * @param {string} [host] - Optional host to use instead of `TEST_URL`.
 * @param {string} [token] - Optional token for authentication.
 */
export const login = async (request, page, host = TEST_URL, token) => {
  if (!host) throw new Error('login: host is required')
  const response = await request.post(`${host.replace(/\/+$/g, '')}/login`, {
    data: { token },
  })
  expect(response.ok()).toBeTruthy()
  await page.goto(host)
}

/**
 * Grants access if needed by making the appropriate API call.
 * This is a noop if `CANVAS_HOST` or `TEST_PATH` are not configured.
 * @param {object} request - Playwright `request` fixture for API calls.
 */
export const grantAccessIfNeeded = async (request) => {
  if (!process.env.CANVAS_HOST || !process.env.TEST_PATH) return
  const host = TEST_URL
  await grantAccess(request, host)
}

/**
 * Internal helper to grant access via API.
 * @param {object} request - Playwright `request` fixture.
 * @param {string} host - The host to call.
 */
const grantAccess = async (request, host) => {
  await request.post(`${host.replace(/\/+$/g, '')}/grant-access`)
}

/**
 * Get the LTI iframe element handle from the page.
 * @param {import('@playwright/test').Page} page - Playwright `page` instance.
 * @returns {Promise<import('@playwright/test').ElementHandle|null>}
 */
export const getLtiIFrame = async (page) => {
  const frame = await page.frameLocator('iframe[name="tool_frame"]')
  return frame ? frame.elementHandle() : null
}

/**
 * Take a screenshot and save it to the given path.
 * @param {import('@playwright/test').Page} page - Playwright `page` instance.
 * @param {string} path - File path to save the screenshot.
 */
export const screenshot = async (page, path) => {
  await page.screenshot({ path })
}

/**
 * Dismiss the beta banner if present on the page.
 * @param {import('@playwright/test').Page} page - Playwright `page` instance.
 */
export const dismissBetaBanner = async (page) => {
  const banner = page.locator('#beta-banner')
  if (await banner.count()) {
    await banner.locator('button[aria-label="Close"]').click()
  }
}

/**
 * Wait for all spinners to disappear from the page.
 * @param {import('@playwright/test').Page} page - Playwright `page` instance.
 */
export const waitForNoSpinners = async (page) => {
  await expect(page.locator('.spinner')).toHaveCount(0, { timeout: 5000 })
}