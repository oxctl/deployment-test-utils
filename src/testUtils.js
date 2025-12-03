import { expect } from '@playwright/test'

/**
 * Normalised test URL built from `CANVAS_HOST` and `TEST_PATH`.
 * `src/setup/assertVariables.js` ensures these env vars exist and are normalised.
 * @type {string}
 */
export const TEST_URL = process.env.CANVAS_HOST + '/' + process.env.TEST_PATH


/**
 * Perform an LTI login by requesting a session token and navigating the page
 * to the returned session URL.
 * @param {import('@playwright/test').APIRequestContext} request - Playwright request context
 * @param {import('@playwright/test').Page} page - Playwright page to navigate
 * @param {string} host - Canvas host (base URL)
 * @param {string} token - OAuth bearer token
 * @returns {Promise<void>}
 */
export const login = async (request, page, host, token) => {
  await Promise.resolve(
    await request.get(`${host}/login/session_token`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(async (response) => {
      const json = await response.json()
      const sessionUrl = json.session_url
      return page.goto(sessionUrl)
    }).catch(error => {
      console.error('Login request failed:', error)
      throw error
    })
  )
}


/**
 * Visit `toolUrl` and complete the grant-access flow if the tool requests it.
 * Navigates the page into the LTI tool, waits for loading to finish and
 * resolves whether the tool requires an explicit grant. If required, the
 * `grantAccess` helper is used to complete the flow.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} toolUrl - URL of the LTI tool to visit
 */
export const grantAccessIfNeeded = async (page, context, toolUrl) => {
  await page.goto(toolUrl)
  const ltiToolFrame = getLtiIFrame(page)

  // wait for tool-support loading page
  await ltiToolFrame.getByText('Loading...').waitFor({
    state: 'detached',
    timeout: 5000,
    strict: false
  })

  const needsGrantAccess = await Promise.race([
    ltiToolFrame.getByText('Please Grant Access').waitFor()
      .then(() => { return true }),
    waitForNoSpinners(ltiToolFrame, 3000)
      .then(() => { return false })
  ])

  if (needsGrantAccess) {
    await grantAccess(context, ltiToolFrame)
  }
}

/**
 * Complete the grant access flow by clicking the authorise button in the
 * popup page. Intended to be used by `grantAccessIfNeeded`.
 *
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {import('@playwright/test').FrameLocator} frameLocator - Locator for the LTI frame
 */
const grantAccess = async (context, frameLocator) => {
  const button = await frameLocator.getByRole('button')
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    button.click()
  ])

  const submit = await newPage.getByRole('button', { name: /Authori[sz]e/ })
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
 */
export const screenshot = async (locator, testInfo) => {
  await locator.screenshot({ path: `${testInfo.outputDir}/${screenshotCount}.png`, fullPage: true })
  screenshotCount++
}

/**
 * Dismiss the beta warning banner if present on the current page.
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export const dismissBetaBanner = async (page) => {
  if (page.url().includes('beta')) {
    const banner = page.getByRole('button', { name: 'Close warning' })
    if (await banner.isVisible()) {
      await page.getByRole('button', { name: 'Close warning' }).click()
    }
  }
}

/**
 * Wait for any `.view-spinner` elements inside the supplied frame locator to
 * disappear. Optionally provide an initial delay before checking.
 *
 * @param {import('@playwright/test').FrameLocator} frameLocator - Frame locator to query
 * @param {number} [initialDelay=1000] - milliseconds to wait before starting checks
 * @returns {Promise<void>}
 */
export const waitForNoSpinners = async (frameLocator, initialDelay = 1000) => {
  await new Promise(r => setTimeout(r, initialDelay))
  await expect(frameLocator.locator('.view-spinner')).toHaveCount(0, { timeout: 10000 })
}