import { test, expect } from '@playwright/test'
import 'dotenv/config'

const REQUIRED = ['CANVAS_HOST', 'OAUTH_TOKEN', 'TEST_PATH']


// Normalise environment variables at module load time
if (process.env.CANVAS_HOST) {
  process.env.CANVAS_HOST = process.env.CANVAS_HOST.trim().replace(/\/+$/, '');
}
if (process.env.TEST_PATH) {
  process.env.TEST_PATH = process.env.TEST_PATH.trim().replace(/^\/+/, '');
}

test('required environment variables are set', async () => {
  for (const key of REQUIRED) {
    expect(process.env[key], `Missing required env var: ${key}`).toBeTruthy()
  }
})
