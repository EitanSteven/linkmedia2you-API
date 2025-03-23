import { exec } from 'child_process'
import util from 'util'
import { initBrowser } from './puppeteer-utils.js'
import fs from 'fs/promises'

const execPromise = util.promisify(exec)
const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const formatCookies = (cookies) => {
  const header = '# HTTP Cookie File\n'
  return header + cookies.map(cookie => [
    cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`,
    'TRUE',
    cookie.path || '/',
    cookie.secure ? 'TRUE' : 'FALSE',
    Math.floor(cookie.expires === -1 ? Date.now() / 1000 + 86400 : cookie.expires),
    cookie.name,
    cookie.value
  ].join('\t')).join('\n')
}

const humanLikeDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  let browser
  try {
    console.log(`🚀 Iniciando descarga (${mediaFormat}) para: ${url}`)

    // 1. Configuración avanzada del navegador
    browser = await initBrowser()
    const page = await browser.newPage()

    // 2. Emulación de hardware real
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
        get: () => undefined,
        configurable: true
      })
    })

    // 3. Navegación avanzada
    const processedUrl = url.replace('/shorts/', '/watch?v=')
    await page.goto(processedUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
      referer: 'https://www.youtube.com/'
    })

    // 4. Comportamiento humano simulado
    await humanLikeDelay(2000)
    await page.mouse.move(100, 100)
    await page.mouse.wheel({ deltaY: 500 })
    await humanLikeDelay(1000)

    // 5. Manejo de cookies mejorado
    try {
      const acceptButton = await page.waitForSelector(
        'button:has-text("Accept all"), button:has-text("Aceptar todo")',
        { timeout: 10000 }
      )
      await acceptButton.click()
      await page.waitForNavigation({ timeout: 30000 })
    } catch (error) {
      console.log('No se encontró el botón de cookies')
    }

    // 6. Extracción de cookies con validación
    const cookies = await page.cookies()
    if (!cookies.some(c => c.name === 'LOGIN_INFO' || c.name === 'PREF')) {
      throw new Error('Faltan cookies esenciales de YouTube')
    }

    const cookiesPath = '/app/cookies/cookies.txt'
    await fs.writeFile(cookiesPath, formatCookies(cookies))

    // 7. Comando yt-dlp con parámetros anti-detection
    const command = [
      'yt-dlp',
      `--cookies ${cookiesPath}`,
      '--no-check-certificates',
      '--force-ipv4',
      '--socket-timeout 30',
      '--source-address 0.0.0.0',
      '--http-chunk-size 10M',
      '--referer "https://www.youtube.com/"',
      '--add-header "Accept-Language:en-US,en;q=0.9"',
      mediaFormat === 'mp4'
        ? '-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --merge-output-format mp4'
        : '-f bestaudio -x --audio-format m4a',
      `--output "${outputFilePath}"`,
      `"${processedUrl}"`
    ].join(' ')

    console.log('⌛ Ejecutando comando:', command)
    // Por esta versión optimizada
    const { stdout: debugOutput, stderr } = await execPromise(command, {
      timeout: 300000
    })

    console.log('✅ Salida del comando:', debugOutput) // Ahora usado
    if (stderr) console.warn('⚠️ Advertencias:', stderr)

    return true
  } catch (error) {
    console.error('❌ Error crítico:', error)
    throw new Error(`Error mejorado: ${error.message}`)
  } finally {
    if (browser) await browser.close()
  }
}
