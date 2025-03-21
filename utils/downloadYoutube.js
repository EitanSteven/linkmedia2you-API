import { exec } from 'child_process'
import util from 'util'
import { unlink } from 'fs/promises'
import path from 'path'

const execPromise = util.promisify(exec)

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  try {
    console.log(`🚀 Iniciando descarga (${mediaFormat}) para: ${url}`)

    if (mediaFormat === 'm4a') {
      const audioCommand = `yt-dlp -f bestaudio -x --audio-format m4a --output "${outputFilePath}" ${url}`
      console.log('Ejecutando comando de audio:', audioCommand)
      await execPromise(audioCommand)
      return true
    }

    if (mediaFormat === 'mp4') {
      // Descarga y fusión automática con yt-dlp
      const videoCommand = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --merge-output-format mp4 --output "${outputFilePath}" ${url}`
      console.log('Ejecutando comando de video:', videoCommand)
      await execPromise(videoCommand)
      return true
    }

    console.error('❌ Formato no soportado:', mediaFormat)
    return false
  } catch (error) {
    console.error('❌ Error en la descarga:', error)
    return false
  }
}
