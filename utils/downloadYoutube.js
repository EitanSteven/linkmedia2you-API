import { exec } from 'child_process'
import util from 'util'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'

const execPromise = util.promisify(exec)

// Función para formatear cookies al formato Netscape que requiere yt-dlp
const formatCookies = (cookies) => {
  return cookies.map(cookie => {
    const domain = cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`
    const expires = cookie.expires === -1 ? 0 : Math.floor(cookie.expires)
    return [
      domain,
      'TRUE',
      cookie.path || '/',
      cookie.secure ? 'TRUE' : 'FALSE',
      expires,
      cookie.name,
      cookie.value
    ].join('\t')
  }).join('\n')
}

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  let browser
  try {
    console.log(`🚀 Iniciando descarga (${mediaFormat}) para: ${url}`)

    // 1. Configurar Puppeteer
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ],
      headless: 'new',
      timeout: 60000
    })

    const page = await browser.newPage()

    // 2. Configurar User-Agent y viewport
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1920, height: 1080 })

    // 3. Navegar a YouTube
    const youtubeUrl = url.includes('shorts')
      ? url.replace('shorts', 'watch')
      : url

    await page.goto(youtubeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    })

    // 4. Manejo de cookies
    try {
      const acceptButton = await page.waitForSelector(
        'button:has-text("Accept all")',
        { timeout: 10000 }
      )
      await acceptButton.click()
      await page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
    } catch (error) {
      console.log('No se encontró el botón de aceptar cookies')
    }

    // 5. Obtener y guardar cookies usando las funciones definidas
    const cookies = await page.cookies()
    await fs.writeFile('/app/cookies/cookies.txt', formatCookies(cookies)) // Aquí usamos ambas

    // 6. Configurar comando base para yt-dlp
    const baseCommand = [
      'yt-dlp',
      '--cookies /app/cookies/cookies.txt',
      '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
      '--referer "https://www.youtube.com/"',
      `--output "${outputFilePath}"`,
      `"${url}"`
    ]

    // 7. Agregar parámetros según el formato
    if (mediaFormat === 'm4a') {
      baseCommand.splice(4, 0,
        '-f bestaudio',
        '-x',
        '--audio-format m4a'
      )
    } else if (mediaFormat === 'mp4') {
      baseCommand.splice(4, 0,
        '-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]"',
        '--merge-output-format mp4'
      )
    } else {
      throw new Error(`Formato no soportado: ${mediaFormat}`)
    }

    // 8. Ejecutar el comando
    const command = baseCommand.join(' ')
    console.log('Ejecutando comando:', command)
    await execPromise(command)

    return true
  } catch (error) {
    console.error('❌ Error en la descarga:', error)
    if (browser) await browser.close()
    return false
  }
}
