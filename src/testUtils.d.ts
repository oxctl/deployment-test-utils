import {APIRequestContext, BrowserContext, FrameLocator, Locator, Page} from "@playwright/test";

/**
 * Normalised test URL built from `CANVAS_HOST` and `TEST_PATH`.
 * `src/setup/assertVariables.js` ensures these env vars exist and are normalised.
 */
export const TEST_URL: string;

/**
 * Perform an LTI login by requesting a session token and navigating the page
 * to the returned session URL.
 *
 * @param request Playwright `APIRequestContext` used for HTTP requests.
 * @param page Playwright page to navigate.
 * @param host Canvas host (base URL).
 * @param token OAuth bearer token.
 */
export function login(
  request: APIRequestContext,
  page: Page,
  host: string,
  token: string
): Promise<void>;

/**
 * Visit `toolUrl` and complete the grant-access flow if the tool requests it.
 * Navigates the page into the LTI tool, waits for loading to finish and
 * resolves whether the tool requires an explicit grant. If required, the
 * `grantAccess` helper is used to complete the flow.
 *
 * @param page Playwright page instance.
 * @param context Playwright browser context.
 * @param toolUrl URL of the LTI tool to visit.
 */
export function grantAccessIfNeeded(
  page: Page,
  context: BrowserContext,
  toolUrl: string
): Promise<void>;

/**
 * Return the frame locator for the LTI launch iframe.
 *
 * **Usage**
 *
 * ```js
 * const ltiIFrame = getLtiIFrame(page)
 * await ltiIFrame.getByText('Hello').click()
 * ```
 *
 * **Details**
 *
 * This helper finds the iframe injected by the LTI launch by querying for
 * `iframe[data-lti-launch="true"]`. It’s a thin wrapper over
 * `page.frameLocator('iframe[data-lti-launch="true"]')` for convenience and
 * consistency in tests.
 *
 * @param page Playwright page.
 * @returns Frame locator for the LTI launch iframe.
 */
export function getLtiIFrame(page: Page): FrameLocator;

/**
 * Take a screenshot of the provided locator and save it into the test
 * output directory. Files are numbered sequentially for the duration of the
 * process.
 *
 * @param locator Locator to screenshot.
 * @param testInfo Playwright `testInfo`-like object; only `outputDir` is used.
 */
export function screenshot(
  locator: Locator,
  testInfo: { outputDir: string }
): Promise<void>;

/**
 * Dismiss the Canvas beta warning banner if present on the current page.
 *
 * Looks for the "Close warning" button in the fixed bottom warning banner
 * that appears on Canvas beta/test instances (for example, the banner
 * described in the Canvas release schedule docs) and clicks it if it is
 * visible.
 *
 * @param page Playwright page.
 */
export function dismissBetaBanner(page: Page): Promise<void>;

/**
 * Wait for any `.view-spinner` elements inside the supplied frame locator to
 * disappear. Optionally provide an initial delay before checking. The
 * underlying assertion will time out after roughly 10 seconds if spinners
 * remain.
 *
 * @param frameLocator Frame locator to query.
 * @param initialDelay Milliseconds to wait before starting checks.
 */
export function waitForNoSpinners(
  frameLocator: FrameLocator,
  initialDelay?: number
): Promise<void>;