import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  try {
    // Convertir URL de Shorts a formato normal
    const processedUrl = url.includes('/shorts/')
      ? url.replace('/shorts/', '/watch?v=')
      : url

    const formatFlag = mediaFormat === 'mp4'
      ? '-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4'
      : '-f bestaudio -x --audio-format m4a'

    const command = `yt-dlp \
      --no-check-certificates \
      --force-ipv4 \
      ${formatFlag} \
      -o "${outputFilePath}" \
      "${processedUrl}"`

    console.log(`📥 Descargando: ${processedUrl}`)
    const { stderr } = await execPromise(command)

    if (stderr.includes('ERROR')) throw new Error(stderr)

    return true
  } catch (error) {
    console.error(`❌ Fallo en ${url}: ${error.message}`)
    return false
  }
}
