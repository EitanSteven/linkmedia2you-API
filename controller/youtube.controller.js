import path from 'path'
import { downloadVideo } from '../utils/downloadYoutube.js'
import { unlink } from 'fs/promises'

export const YoutubeController = async (req, res) => {
  console.log('Controlador Youtube')

  const __download = req.app.locals.__download
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

  const videoId = `YT_${Date.now()}`

  let mediaFormat = ''
  if (format === 'audio') mediaFormat = 'm4a'
  if (format === 'video') mediaFormat = 'mp4'

  console.log(`URL: ${url}`)
  console.log(`FORMAT: ${mediaFormat}`)

  const videoFilePath = path.join(__download, `${videoId}.${mediaFormat}`)
  console.log('File video Path: ', videoFilePath)

  // IV Descargamos video
  const succes = await downloadVideo(videoId, url, videoFilePath, mediaFormat)

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
