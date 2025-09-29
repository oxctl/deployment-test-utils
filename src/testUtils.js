import { expect } from '@playwright/test'
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

export const grantAccessIfNeeded = async(page, context, toolUrl) => {
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
      .then(() => { return true } ),
    waitForNoSpinners(ltiToolFrame, 3000)
      .then(() => { return false } )
  ])

  if(needsGrantAccess){
    await grantAccess(context, ltiToolFrame)
  }
}

const grantAccess = async (context, frameLocator) => {
  const button = await frameLocator.getByRole('button')
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    button.click()
  ])

  const submit = await newPage.getByRole('button', {name: /Authori[sz]e/})
  await submit.click()
  const close = await newPage.getByText('Close', {exact: true})
  await close.click()
}

export const getLtiIFrame = (page) => {
  return page.frameLocator('iframe[data-lti-launch="true"]')
}

let screenshotCount = 1
export const screenshot = async (locator, testInfo) => {
  await locator.screenshot({path: `${testInfo.outputDir}/${screenshotCount}.png`, fullPage: true})
  screenshotCount++
}

export const dismissBetaBanner = async (page) => {
  if (page.url().includes('beta')) {
    const banner = page.getByRole('button', { name: 'Close warning' })
    if (await banner.isVisible()) {
      await page.getByRole('button', {name: 'Close warning'}).click();
    }
  }
}

export const waitForNoSpinners = async (frameLocator, initialDelay = 1000) => {
  await new Promise(r => setTimeout(r, initialDelay));
  await expect(frameLocator.locator('.view-spinner')).toHaveCount(0, { timeout: 10000 });
}