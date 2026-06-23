import { expect } from '@playwright/test'

/**
 * Normalised test URL built from `CANVAS_HOST` and `TEST_PATH`.
 * @type {string}
 */
export const TEST_URL = buildTestUrl(
  process.env.CANVAS_HOST,
  process.env.TEST_PATH
)

/**
 * @typedef {Object} GrantAccessOptions
 * @property {'lti'|'page'} [scope='lti'] - Where the tool renders. Defaults to existing LTI behavior.
 * @property {number} [promptTimeoutMs=3000] - Max wait for "Please Grant Access" prompt.
 */

/**
 * Visit `toolUrl` and complete the grant-access flow if the tool requests it.
 * Backward compatible: defaults to LTI iframe flow.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} toolUrl - URL of the LTI tool to visit
 * @param {GrantAccessOptions} [options]
 * @returns {Promise<void>}
 */
export const grantAccessIfNeeded = async (page, context, toolUrl, options = {}) => {
  const { scope = 'lti', promptTimeoutMs = 3000 } = options

  await page.goto(toolUrl)
  const scopeRoot = scope === 'lti' ? getLtiIFrame(page) : page

  // LTI tools commonly show a temporary loading screen inside the iframe.
  if (scope === 'lti') {
    await scopeRoot.getByText('Loading...').waitFor({
      state: 'detached',
      timeout: 5000,
      strict: false
    })
  }

  const needsGrantAccess = await Promise.race([
    scopeRoot.getByText('Please Grant Access').waitFor({
      state: 'visible',
      timeout: promptTimeoutMs
    })
      .then(() => { return true }),
    waitForNoSpinners(scopeRoot, 3000)
      .then(() => { return false })
  ])

  if (needsGrantAccess) {
    await grantAccess(context, scopeRoot)
  }
}

/**
 * Complete the grant access flow by clicking the authorise button in the
 * popup page. Intended to be used by `grantAccessIfNeeded`.
 *
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {import('@playwright/test').FrameLocator | import('@playwright/test').Page} scopeRoot - LTI frame or page root
 * @returns {Promise<void>}
 */
const grantAccess = async (context, scopeRoot) => {
  const button = scopeRoot.getByRole('button').first()
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    button.click()
  ])

  const submit = await newPage.getByRole('button', { name: /Authori[sz]e/i })
  await submit.click()
  const close = await newPage.getByText('Close', { exact: true })
  await close.click()
}


/**
 * Return the frame locator for the LTI launch iframe.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {import('@playwright/test').FrameLocator}
 */
export const getLtiIFrame = (page) => {
  return page.frameLocator('iframe[data-lti-launch="true"]')
}

let screenshotCount = 1
/**
 * Take a screenshot of the provided locator and save it into the test
 * output directory. Files are numbered sequentially for the duration of the
 * process.
 *
 * @param {import('@playwright/test').Locator} locator - Locator to screenshot
 * @param {{ outputDir: string }} testInfo - Playwright `testInfo` object (only `outputDir` used)
 * @returns {Promise<void>}
 */
export const screenshot = async (locator, testInfo) => {
  await locator.screenshot({ path: `${testInfo.outputDir}/${screenshotCount}.png`, fullPage: true })
  screenshotCount++
}

/**
 * Dismiss the beta warning banner if present on the current page.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<void>}
 */
export const dismissBetaBanner = async (page) => {
  if (page.url().includes('beta')) {
    const banner = page.getByRole('button', { name: 'Close warning' })
    if (await banner.isVisible()) {
      await banner.click()
    }
  }
}

/**
 * Wait for any `.view-spinner` elements inside the supplied frame locator to
 * disappear. Optionally provide an initial delay before checking.
 *
 * @param {import('@playwright/test').FrameLocator | import('@playwright/test').Page} frameLocator - Frame locator or page to query
 * @param {number} [initialDelay=1000] - milliseconds to wait before starting checks
 * @returns {Promise<void>}
 */
export const waitForNoSpinners = async (frameLocator, initialDelay = 1000) => {
  await new Promise(r => setTimeout(r, initialDelay))
  await expect(frameLocator.locator('.view-spinner')).toHaveCount(0, { timeout: 10000 })
}

function normalizeUrlParts(host, path) {
  return {
    host: host.trim().replace(/\/+$/, ''),
    path: path.trim().replace(/^\/+/, '')
  }
}

function buildTestUrl(host, path) {
  const { host: normalizedHost, path: normalizedPath } = normalizeUrlParts(host, path)
  return `${normalizedHost}/${normalizedPath}`
}