import { exec } from 'child_process'
import util from 'util'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'

const execPromise = util.promisify(exec)

// Función mejorada para formatear cookies
const formatCookies = (cookies) => {
  const header = '# HTTP Cookie File\n' // Encabezado necesario
  const formatted = cookies.map(cookie => {
    const domain = cookie.domain.startsWith('.') ? cookie.domain : `.${cookie.domain}`
    const expires = cookie.expires === -1
      ? Math.floor(Date.now() / 1000) + 3600 // 1 hora si es cookie de sesión
      : Math.floor(cookie.expires)

    return [
      domain,
      'TRUE',
      cookie.path || '/',
      cookie.secure ? 'TRUE' : 'FALSE',
      expires.toString(),
      cookie.name,
      cookie.value
    ].join('\t')
  }).join('\n')

  return header + formatted
}

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  let browser
  try {
    console.log(`🚀 Iniciando descarga (${mediaFormat}) para: ${url}`)

    // 1. Configuración mejorada de Puppeteer
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

    // 2. Configuración de navegación
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1280, height: 720 })
    await page.setJavaScriptEnabled(true)

    // 3. Manejo de URLs de Shorts
    const processedUrl = url.replace('/shorts/', '/watch?v=')

    // 4. Navegación con timeout extendido
    await page.goto(processedUrl, {
      waitUntil: 'networkidle2',
      timeout: 120000
    })

    // 5. Manejo de cookies mejorado
    try {
      const acceptButton = await page.waitForSelector(
        'button:has-text("Accept all"), button:has-text("Aceptar todo")',
        { timeout: 15000 }
      )
      await acceptButton.click()
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 45000
      })
    } catch (error) {
      console.log('No se encontró el botón de aceptar cookies')
    }

    // 6. Obtención y guardado de cookies
    const cookies = await page.cookies()
    const cookiesDir = '/app/cookies'
    const cookiesPath = `${cookiesDir}/cookies.txt`

    await fs.mkdir(cookiesDir, { recursive: true })
    await fs.writeFile(cookiesPath, formatCookies(cookies))
    console.log('✅ Cookies guardadas correctamente en:', cookiesPath)

    // 7. Configuración dinámica del comando
    const commandOptions = [
      '--cookies', cookiesPath,
      '--user-agent', '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
      '--referer', '"https://www.youtube.com/"',
      '--output', `"${outputFilePath}"`,
      `"${processedUrl}"`
    ]

    if (mediaFormat === 'm4a') {
      commandOptions.splice(2, 0,
        '-f', 'bestaudio',
        '-x',
        '--audio-format', 'm4a'
      )
    } else if (mediaFormat === 'mp4') {
      commandOptions.splice(2, 0,
        '-f', '"bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]"',
        '--merge-output-format', 'mp4'
      )
    }

    // 8. Ejecución segura del comando
    const command = ['yt-dlp', ...commandOptions].join(' ')
    console.log('⌛ Ejecutando comando:', command)

    const { stdout, stderr } = await execPromise(command, {
      timeout: 300000 // 5 minutos timeout
    })

    if (stderr) console.warn('⚠️ Advertencias:', stderr)

    return true
  } catch (error) {
    console.error('❌ Error crítico:', error)
    throw new Error(`Fallo en la descarga: ${error.message}`)
  } finally {
    if (browser) await browser.close()
  }
}
