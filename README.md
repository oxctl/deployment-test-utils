# @oxctl/deployment-test-utils

Shared configuration and utility scripts to support Canvas LTI tool deployment (E2E) tests with Playwright.

This package provides:

 * Playwright configuration (`config.js`)
   - Includes `assertVariables` and `setup` projects that run before your deployment tests.
 * Setup scripts under `src/setup/`
   - `assertVariables.js` – ensures required environment variables are set.
   - `auth.setup.js` – authenticates and writes a temporary Playwright `storageState` for your tests.
 * Reusable test utilities (`testUtils.js`)
   - Helpers for logging in, handling banners, waiting for spinners, etc.

⸻

## Installation

In your consumer project (the project in which you want to run deployment tests):

```bash
npm i @oxctl/deployment-test-utils
```
## Configuration
Add the required dev dependencies to your project (use your preferred package manager and versions):

```bash
npm i -D @oxctl/deployment-test-utils @playwright/test dotenv
```

> [!NOTE] 
> Playwright 1.58.0 introduced a [bug](https://github.com/microsoft/playwright/issues/39172) that causes duplicate test title errors. The latest release of this library version locks Playwright to <1.58.0 to avoid this issue, but if you are using a later version of Playwright in your project, you may need to adjust the version in your `package.json` to avoid conflicts.

Optionally install Playwright browser binaries (if you haven't already):

```bash
npx playwright install
```

This library does not pin a Node.js or Playwright version. Use versions appropriate for your project.
Any recent Playwright Test 1.x release should work; align with what you already use.





## Write The Tests 

The following must be set (locally via .env, or in CI via your provider's secrets/variables):
 * `CANVAS_HOST` - trailing slash is optional
 * `OAUTH_TOKEN`
 * `TEST_PATH` - leading slash is optional (Previously named `URL` which was changed as it was found to be confusing.)


If any are missing, `assertVariables.js` will fail fast to help you diagnose configuration.

Example:

```bash
CANVAS_HOST=https://wibble.instructure.com
OAUTH_TOKEN=12345~QWERTYUIOPASDFGHJKLZXCVBNM
TEST_PATH=/accounts/1/external_tools/789
```

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
Run tests using your normal Playwright command (for example):

```bash
npm run test
```
## Auth storage state

The setup project (`auth.setup.js`) will:
 * Authenticate using your token/URL.
 * Write a `playwright/.auth/user.json` into the consumer repo workspace.
 * Your deployment tests (browser projects e.g. `chromium`) then reuse this state via `storageState` .

⚠️ Note: In __GitHub Actions__ this file is only created in the ephemeral job workspace and is cleaned up automatically when the job ends. It is not committed to source control, and there is no risk of leaking long-lived credentials.

It is not tidied up on your local machine and should never be committed to source control so should be added to `.gitignore` (see above).

⸻

## Project structure

```
src/
├── config.js          # exports Playwright projects
├── testUtils.js       # reusable Playwright helpers
└── setup/
├── assertVariables.js
└── auth.setup.js
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
