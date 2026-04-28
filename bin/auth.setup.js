#!/usr/bin/env node
import {chromium, request} from 'playwright'
import fs from 'fs/promises'
import path from 'path'
import 'dotenv/config'
import { buildTestUrl } from '../dist/url.js'

const host = process.env.CANVAS_HOST
const token = process.env.OAUTH_TOKEN
const testPath = process.env.TEST_PATH

if (!host) {
  console.error('Missing CANVAS_HOST')
  process.exit(1)
}

if (!token) {
  console.error('Missing OAUTH_TOKEN')
  process.exit(1)
}

if (!testPath) {
  console.error('Missing TEST_PATH')
  process.exit(1)
}

const authFile = path.resolve(process.cwd(), 'playwright/.auth/user.json')

async function main() {
  await fs.mkdir(path.dirname(authFile), {recursive: true})

  const api = await request.newContext()

  const response = await api.get(`${host}/login/session_token`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok()) {
    const status = response.status()
    const body = await response.text()
    console.error(`Failed to fetch session token: HTTP ${status}`)
    console.error(`Response body: ${body}`)
    process.exit(1)
  }

  const {session_url} = await response.json()

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(session_url)
  await page.goto(buildTestUrl(host, testPath))

  await context.storageState({path: authFile})

  await browser.close()
  await api.dispose()
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
