// import ytdlp from 'yt-dlp-exec'
import { exec } from '@distube/yt-dlp'

export const downloadVideo = async (url, videoFilePath, mediaFormat) => {
  let count = 0
  let succes = false
  while (count <= 3) {
    try {
      console.log(`Intento de Descarga N ° ${count}`)
      await exec(url, {
        output: videoFilePath,
        format: `${mediaFormat === 'mp4' ? 'best' : 'bestaudio'}`,
        verbose: true
      })

      console.log('🚀 ¡Video Descargado!')
      succes = true
      return succes
    } catch (error) {
      count++
      console.error('❌ Error:', error.message)
      console.log(`Reintentando || Contador: ${count}`)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Esperamos antes de volver a intentar
    }
  }
}
