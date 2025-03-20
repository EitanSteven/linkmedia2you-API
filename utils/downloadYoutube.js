// import ytdlp from 'yt-dlp-exec'

import ytdlp from '@distube/yt-dlp'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { unlink } from 'fs/promises'
import path from 'path'

// Configuramos la ruta de FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath)

export const downloadVideo = async (videoId, url, outputFilePath, mediaFormat) => {
  try {
    console.log(`🚀 Iniciando descarga (${mediaFormat}) para: ${url}`)

    const downloadDir = path.dirname(outputFilePath)

    if (mediaFormat === 'm4a') {
      // Solo descargar audio en el mejor formato disponible
      await ytdlp(url, {
        output: outputFilePath,
        format: 'bestaudio',
        verbose: true
      })
      console.log('🎵 Audio descargado correctamente:', outputFilePath)
      return true
    }

    if (mediaFormat === 'mp4') {
      // Crear rutas temporales para el video y audio
      const videoPath = path.join(downloadDir, `temp_${videoId}.mp4`)
      const audioPath = path.join(downloadDir, `temp_${videoId}.m4a`)

      // Descarga el video sin audio en la mejor calidad
      await ytdlp(url, {
        output: videoPath,
        format: 'bestvideo[ext=mp4]/bestvideo', // Prioriza el mejor video en MP4, luego el mejor video disponible
        verbose: true
      })

      // Descarga el audio en el mejor formato disponible
      await ytdlp(url, {
        output: audioPath,
        format: 'bestaudio[ext=m4a]/bestaudio', // Prioriza el mejor audio en M4A, luego el mejor audio disponible
        verbose: true
      })

      console.log('🎬 Descarga completada, iniciando fusión con FFmpeg...')

      // Fusionar video y audio con FFmpeg
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(videoPath) // Entrada de video
          .input(audioPath) // Entrada de audio
          .outputOptions('-c:v copy') // No recodificar el video
          .outputOptions('-c:a aac') // Audio en AAC para compatibilidad con MP4
          .save(outputFilePath) // Guardar el archivo final
          .on('end', async () => {
            console.log('✅ Fusión completada:', outputFilePath)
            await unlink(videoPath) // Eliminar archivo de video temporal
            await unlink(audioPath) // Eliminar archivo de audio temporal
            console.log('🗑️ Archivos temporales eliminados')
            resolve()
          })
          .on('error', (err) => {
            console.error('❌ Error al fusionar:', err)
            reject(err)
          })
      })
      return true
    }

    console.error('❌ Formato no soportado:', mediaFormat)
    return false
  } catch (error) {
    console.error('❌ Error en la descarga/fusión:', error)
    return false
  }
}
