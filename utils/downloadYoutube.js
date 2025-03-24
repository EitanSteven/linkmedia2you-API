import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  try {
    const formatArgs = mediaFormat === 'mp4'
      ? ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best', '--merge-output-format', 'mp4']
      : ['-f', 'bestaudio', '-x', '--audio-format', 'm4a']

    // Usar ruta absoluta dentro del contenedor
    const args = [
      '--cookies', '/app/cookies/cookies.txt', // Ruta corregida
      '--no-check-certificates',
      '--force-ipv4',
      ...formatArgs,
      '-o', outputFilePath,
      url
    ]

    console.log(`📥 Descargando: ${url}`)
    await execAsync(`yt-dlp ${args.join(' ')}`)

    return true
  } catch (error) {
    console.error(`❌ Fallo en ${url}: ${error.stderr || error.message}`)
    return false
  }
}
