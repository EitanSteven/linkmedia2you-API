import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

export const downloadVideo = async (url, videoFilePath, mediaFormat) => {
  let count = 0
  let success = false
  while (count <= 3) {
    try {
      console.log(`Intento de Descarga N° ${count}`)

      // Ejecutar yt-dlp globalmente
      const command = `/usr/local/bin/yt-dlp -o "${videoFilePath}" -f "${mediaFormat === 'mp4' ? 'best' : 'bestaudio'}" "${url}"`
      await execPromise(command)

      console.log('🚀 ¡Video Descargado!')
      success = true
      return success
    } catch (error) {
      count++
      console.error(error.message)
      console.log(`Reintentando || Contador: ${count}`)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Esperamos antes de volver a intentar
    }
  }
}
