import { test as setup } from '@playwright/test'
import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { grantAccessIfNeeded, login } from '@oxctl/deployment-test-utils'

// Write storage to the consumer repo, not node_modules
const authFile = path.resolve(process.cwd(), 'playwright/.auth/user.json')

const host = process.env.CANVAS_HOST
const token= process.env.OAUTH_TOKEN
const url  = process.env.URL

setup('authenticate', async ({ context, page }) => {
  await fs.mkdir(path.dirname(authFile), { recursive: true })

  await login(page.request, page, host, token)
  await grantAccessIfNeeded(page, context, `${host}/${url}`)
  await page.context().storageState({ path: authFile })
})