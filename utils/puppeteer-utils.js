import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { executablePath } from 'puppeteer'

puppeteer.use(StealthPlugin())

export const initBrowser = async () => {
  return await puppeteer.launch({
    executablePath: executablePath(),
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreHTTPSErrors: true,
    userDataDir: '/app/user-data'
  })
}
