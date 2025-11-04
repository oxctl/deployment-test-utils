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
## Set Up Local Infrastructure

You should create a folder called `deployment`. Change into it and create a `.gitignore` file with the following contents (plus extra lines if appropriate)  

```
.env
# Playwright outputs
playwright-report/
test-results/
playwright/
```
Create a file called `.nvmrc` to set the Node.js version  to v22 or higher. Create a file called `package.json` 

```
{
  "name": "deployment",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "install-browsers": "npx playwright install",
    "test": "npx playwright test",
    "test:ci": "CI=true npx playwright test"
  },
  "devDependencies": {
    "@oxctl/deployment-test-utils": "1.0.1",
    "@playwright/test": "^1.36.2",
    "dotenv": "^16.3.1"
  }
}
```
then generate `package-lock.json`

```bash
run npm install
```
Finally install [Playwright](https://playwright.dev/ "Playwright homepage")

```bash
npx playwright install
```

Set up environment variables. When running tests from a local machine, set the following in a `.env` file; if running the tests via a Github Actions, set these as project Variables or organizational Secrets.

The following must be set (locally or in CI):
 * `CANVAS_HOST`
 * `OAUTH_TOKEN`
 * `URL`

The `CANVAS_HOST` should include the protocol, domain and port but should omit the trailing slash. The `URL` is the path of the URL with the initial slash removed.
Here is an example,

```bash
CANVAS_HOST=https://wibble.instructure.com
OAUTH_TOKEN=12345~QWERTYUIOPASDFGHJKLZXCVBNM
URL=accounts/1/external_tools/789
```

Should any of these variables be missing, `assertVariables.js` will fail.

Create a file called `playwright.config.js` with these contents:

```js
import { config as defaultConfig } from '@oxctl/deployment-test-utils/config'

export default {
  ...defaultConfig,
  // you can add or override settings here
}
```

This ensures Playwright:

  - Runs the shared `assertVariables` project, then: 
  - Runs the shared `setup` project (auth), then: 
  - Finally runs your deployment tests.

## Write The Tests 

Use the utilities from this repository when writing your deployment tests. Create file called `deployment.test.js` which will define thetests to run. Here's an example which looks for specific text `XXXXXXXXXXXXXXX` on a page - the test(s) can be as simple or as complex as seems appropriate.

```js
import { test, expect } from '@playwright/test'
import { dismissBetaBanner, getLtiIFrame, waitForNoSpinners } from '@oxctl/deployment-test-utils'

const host = process.env.CANVAS_HOST
const url = process.env.URL

test.describe('Test deployment', async () => {
  await test('The tool should load and the text "XXXXXXXXXXXXXXX" should be shown', async ({context, page}) => {
    await page.goto(`${host}/${url}`)
    await dismissBetaBanner(page)
    const ltiIFrame = getLtiIFrame(page)
    await waitForNoSpinners(ltiIFrame)

    // Check there's specific text on the page
    const text = ltiIFrame.getByText("XXXXXXXXXXXXXXX")
    await expect(text).toBeVisible();
  })
})
```
To run the tests, use 

```bash
npm run test
```
## Auth storage state

The setup project (`auth.setup.js`) will:
 * Authenticate using your token/URL.
 * Write a `playwright/.auth/user.json` into the consumer repo workspace.
 * Your deployment tests (browser projects e.g. `chromium`) then reuse this state via `storageState` .

⚠️ Note: In GitHub Actions this file is only created in the ephemeral job workspace and should be cleaned up automatically when the job ends. It should never be committed to source control so it is highly recommended that it is added to `.gitignore`.

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
