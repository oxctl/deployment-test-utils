import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

export const config = {
  projects: [
    {
      name: 'assertVariables',
      testDir: path.resolve(__dirname, 'setup'),
      testMatch: /assertVariables\.js/,
    },
    {
      name: 'setup',
      testDir: path.resolve(__dirname, 'setup'),
      testMatch: /.*\.setup\.js/,
      dependencies: ['assertVariables'],
    },
    {
      name: 'chromium',
      testDir: process.cwd(), // consumer repo
      use: {
        storageState: path.resolve(process.cwd(), 'playwright/.auth/user.json')
      },
      dependencies: ['setup'],
    }
  ],
  timeout: 60000,
  reporter: [['html', { open: 'never' }]],
  retries: 2,
  use: {
    video: 'on',
    launchOptions: { slowMo: 500 }
  }
}