import { buildTestUrl } from './shared/util.js'
export { grantAccessIfNeeded, getLtiIFrame, waitForNoSpinners } from './shared/util.js'

/**
 * Normalised test URL built from `CANVAS_HOST` and `TEST_PATH`.
 * @type {string}
 */
export const TEST_URL = buildTestUrl(
  process.env.CANVAS_HOST,
  process.env.TEST_PATH
)



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