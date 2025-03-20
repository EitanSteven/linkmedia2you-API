import path from 'path'
import { unlink } from 'fs/promises'
import { downloadVideo } from '../utils/downloadVideo.js'

export const TwitterController = async (req, res) => {
  console.log('Controlador twitter')

  const __download = '/downloads'
  console.log(`Download Dir: ${__download}`)

  const { url, format } = req.query

  if (!url) {
    res.status(400).json({
      succes: false,
      message: 'URL is Required.'
    })
  }

  if (!format) {
    res.status(400).json({
      succes: false,
      message: 'Format is Required.'
    })
  }

  const videoId = `Twitter_${Date.now()}`

  let mediaFormat = ''
  if (format === 'audio') mediaFormat = 'm4a'
  if (format === 'video') mediaFormat = 'mp4'

  console.log(`URL: ${url}`)
  console.log(`FORMAT: ${mediaFormat}`)

  const videoFilePath = path.join(__download, `${videoId}.${mediaFormat}`)
  console.log('File video Path: ', videoFilePath)

  console.log(`ytdlpFormat en Linea: ${mediaFormat === 'mp4' ? 'best' : 'bestaudio'}`)

  // IV Descargamos video
  const succes = await downloadVideo(url, videoFilePath, mediaFormat)

  if (succes) {
    res.download(videoFilePath, 'video.mp4', async (err) => {
      if (!err) {
        console.log('✅ Archivo enviado con éxito')
        await unlink(videoFilePath)
        console.log('🗑️ Archivos temporales eliminados')
      }
    })
  } else {
    res.status(400).json({
      succes: false,
      message: 'Error al descargar video.'
    })
  }
}

// Twitter_1741211993076
