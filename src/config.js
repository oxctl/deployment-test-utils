import 'dotenv/config'
import path from 'node:path'

export const config = {
  projects: [
    {
      name: 'chromium',
      testDir: process.cwd(), // consumer repo
      use: {
        storageState: path.resolve(process.cwd(), 'playwright/.auth/user.json')
      }
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