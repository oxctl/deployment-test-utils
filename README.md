# @oxctl/deployment-test-utils

Shared configuration and utility scripts to support Canvas LTI tool deployment (E2E) tests with Playwright.

This package provides:

 * A pre-test authentication CLI (deployment-generate-auth)
 * A shared Playwright config
 * A small set of test utilities (helpers for logging in, handling banners, waiting for spinners, etc.)

Authentication is performed outside of Playwright tests and persisted via `storageState`, avoiding token leakage in reports. 

## Installation

In your consumer project (the project in which you want to run deployment tests):

```bash
npm i -D @oxctl/deployment-test-utils
```
## Configuration
Add the required dev dependencies to your project (use your preferred package manager and versions):

```bash
npm i -D @oxctl/deployment-test-utils @playwright/test dotenv
```

Optionally install Playwright browser binaries (if you haven't already):

```bash
npx playwright install
```

This library does not pin a Node.js version. Use a version appropriate for your project.

> [!NOTE]
> Playwright 1.58.0 introduced a [bug](https://github.com/microsoft/playwright/issues/39172) that causes duplicate test title errors. This version of the library constrains Playwright to <1.58.0 to avoid this issue, but if you are using a later version of Playwright in your project, you may need to adjust the version in your `package.json` to avoid conflicts.

## Environment variables

The following must be set (locally via `.env`, or in CI via your provider's secrets/variables):
 * `CANVAS_HOST` - trailing slash is optional
 * `OAUTH_TOKEN`
 * `TEST_PATH` - leading slash is optional (Previously named `URL` which was changed as it was found to be confusing.)

Example:

```bash
CANVAS_HOST=https://wibble.instructure.com
OAUTH_TOKEN=12345~QWERTYUIOPASDFGHJKLZXCVBNM
TEST_PATH=/accounts/1/external_tools/789
```

## Authentication (pre-test step)

This package exposes a CLI, `deployment-generate-auth`
It will:

1. Validate required environment variables
2. Request a session token
3. Launch a browser and establish a session
4. Save Playwright `storageState` to: `playwright/.auth/user.json` in the consumer repo workspace

⚠️ Note: In __GitHub Actions__ this file is only created in the ephemeral job workspace and is cleaned up automatically when the job ends. It is not committed to source control, and there is no risk of leaking long-lived credentials.

It is not tidied up on your local machine and should never be committed to source control so should be added to `.gitignore`.

## Playwright config

```javascript
import { config } from '@oxctl/deployment-test-utils'

export default config
```
The config:
  * Loads `.env`
  * Uses the generated `storageState`

## Write The Tests

Use the utilities from this repository when writing your deployment tests. Here's a simple example which asserts that some specific text, `XXXXXXXXXXXXXXX`, appears on a page. The test(s) can be as simple or as complex as seems appropriate.

```js
import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners, TEST_URL } from '@oxctl/deployment-test-utils'

test.describe('Test deployment', () => {
    test('The tool should load and the text "XXXXXXXXXXXXXXX" should be shown', async ({context, page}) => {
    await page.goto(TEST_URL)
    await dismissBetaBanner(page)
    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)

    // Check there's specific text on the page
    const text = ltiIFrame.getByText("XXXXXXXXXXXXXXX")
    await expect(text).toBeVisible();
  })
})
```

## Recommended npm scripts

```bash
{
  "scripts": {
    "pretest": "deployment-generate-auth",
    "test": "playwright test",
    "test:ci": "CI=true npm test",
    "test:ui": "npm test -- --ui",
    "test:report": "playwright show-report"
  }
}
```

This ensures auth always runs before tests.

## Project structure

```
src/
├── config.js          # shared Playwright config (loads dotenv, sets `storageState`)
├── testUtils.js       # reusable Playwright helpers and `TEST_URL`
├── shared/
│   └── url.js         # pure helpers for normalising/building URLs

bin/
└── auth.setup.js      # CLI: generates authenticated `storageState`
```

## Development

In this repo:

```bash
npm run build      # bundle testUtils.js to dist/
npm pack           # create a tarball for local install
```

In the consumer repo:

```bash
npm i ../path/to/oxctl-deployment-test-utils-1.0.0.tgz
```

Then run tests as normal:

```bash
npx playwright test
```


## Releasing

This library is published to npmjs. To make a new release do either:

```bash
npm version patch
```
for a small change, or

```bash
npm version minor
```
for a large or 'breaking' change.



And then if it completes ok push the tags and GitHub actions will build and publish the package to npmjs.

```bash
git push
git push --tags
```
