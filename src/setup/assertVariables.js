import { test, expect } from '@playwright/test'
import 'dotenv/config'

const REQUIRED = ['CANVAS_HOST', 'OAUTH_TOKEN', 'URL']

test('required environment variables are set', async () => {
  for (const key of REQUIRED) {
    expect(process.env[key], `Missing required env var: ${key}`).toBeTruthy()
  }
})