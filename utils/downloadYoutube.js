import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export const downloadVideo = async (url, outputPath, format) => {
  const formatFlag = format === 'mp4'
    ? '-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4'
    : '-f bestaudio -x --audio-format m4a'

  const command = `yt-dlp \
    --no-check-certificates \
    --force-ipv4 \
    --throttled-rate 1M \
    --socket-timeout 30 \
    ${formatFlag} \
    -o "${outputPath}" \
    "${url}"`

  try {
    console.log(`📥 Descargando: ${url}`)
    const { stderr } = await execPromise(command) // Solo necesitamos stderr

    if (stderr) {
      if (stderr.includes('429')) {
        throw new Error('Límite de solicitudes excedido')
      }
      console.warn('⚠️ Mensajes:', stderr)
    }

    return true
  } catch (error) {
    console.error(`❌ Fallo en ${url}: ${error.message}`)
    return false
  }
}
