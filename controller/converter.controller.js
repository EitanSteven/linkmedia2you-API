import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import path from 'path'
// import { unlink } from 'fs/promises'

// Configurar el Path de FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath)

export const ConverterController = async (req, res) => {
  console.log('Hola Convertidor')

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File to convert is required.' })
  }

  const filePath = req.file.path
  console.log('Archivo recibido:', filePath)

  // Directorio de descargas
  const __download = req.app.locals.__download
  console.log(`Download Dir: ${__download}`)

  const fileID = `To${Date.now()}`
  const convertedFilePath = path.join(__download, `${fileID}.mp3`)
  console.log('Dirección final del archivo:', convertedFilePath)

  // Convertimos MP4 a MP3
  ffmpeg(filePath)
    .output(convertedFilePath)
    .audioCodec('libmp3lame')
    .on('start', (cmd) => console.log(`🎬 FFmpeg comando: ${cmd}`))
    .on('end', () => {
      console.log('✅ Conversión Exitosa.')
      return res.download(convertedFilePath, 'audio.mp3', async () => {
        console.log('🗑️ Archivos temporales eliminados')
        // await unlink(videoFilePath)
      })
    })
    .on('error', (err) => {
      console.error('❌ Error al convertir:', err)
      return res.status(500).json({ message: 'Error en la conversión.', error: err.message })
    })
    .run()
}
