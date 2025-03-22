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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    })

    const page = await browser.newPage()

    // 2. Navegar a YouTube para obtener cookies
    await page.goto('https://www.youtube.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // 3. Intentar aceptar cookies (para usuarios europeos)
    try {
      const acceptButton = await page.waitForSelector(
        'button:has-text("Accept all")',
        { timeout: 5000 }
      )
      await acceptButton.click()
      await page.waitForNavigation({ waitUntil: 'networkidle2' })
    } catch (error) {
      console.log('No se encontró el botón de aceptar cookies')
    }

    // 4. Obtener y guardar cookies
    const cookies = await page.cookies()
    await fs.writeFile('/app/cookies/cookies.txt', formatCookies(cookies))
    await browser.close()

    // 5. Configurar comando base para yt-dlp
    const baseCommand = [
      'yt-dlp',
      '--cookies /app/cookies/cookies.txt',
      '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
      '--referer "https://www.youtube.com/"',
      `--output "${outputFilePath}"`,
      `"${url}"`
    ]

    // 6. Agregar parámetros según el formato
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

    // 7. Ejecutar el comando
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
