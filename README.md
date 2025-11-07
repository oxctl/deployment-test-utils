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

## Usage

1. Import the shared config

In your consumer’s `playwright.config.js`:

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

2. Use the utilities in your tests

```js
import { dismissBetaBanner, getLtiIFrame } from '@oxctl/deployment-test-utils/testUtils'

test('my test', async ({ page, context }) => {
  await page.goto(`${process.env.CANVAS_HOST}/${process.env.DEPLOYMENT_TEST_URL}`)
  await dismissBetaBanner(page)
  const ltiIFrame = getLtiIFrame(page)
  // etc
})
```

3. Environment variables

The following must be set (locally or in CI):
 * `CANVAS_HOST` - trailing slash is optional
 * `OAUTH_TOKEN`
 * `DEPLOYMENT_TEST_URL` 

`assertVariables.js` will fail early if any are missing.

4. Auth storage state

The setup project (`auth.setup.js`) will:
 * Authenticate using your token/URL.
 * Write a `playwright/.auth/user.json` into the consumer repo workspace.
 * Your deployment tests (browser projects e.g. `chromium`) then reuse this state via `storageState` .

⚠️ Note: In GitHub Actions this file is only created in the ephemeral job workspace and is cleaned up automatically when the job ends. It is not committed to source control, and there is no risk of leaking long-lived credentials.

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