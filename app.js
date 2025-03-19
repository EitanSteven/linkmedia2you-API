import express from 'express'
import cors from 'cors'

import { TwitterRouter } from './routes/twitter.routes.js'
import { YoutubeRouter } from './routes/youtube.routes.js'
import { FacebookRouter } from './routes/facebook.routes.js'
import { ConverterRouter } from './routes/converter.routes.js'

import { fileURLToPath } from 'url'
import path from 'path'
import { mkdir, access } from 'fs/promises'

// Configurar Paths

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __download = path.join(__dirname, 'downloads')

// Creamos y Validamos el Download Directory

async function pathExist (path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function downloadDirValidator (ruta) {
  if (!await pathExist(ruta)) {
    await mkdir(ruta, { recursive: true })
  }
}

downloadDirValidator(__download)

// App General

const app = express()

// Configuración de CORS para permitir solicitudes de cualquier origen
app.use(cors()) // Esto permite solicitudes de cualquier frontend

app.locals.__download = __download

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hola Mundo')
})

app.use('/api/v1/twitter', TwitterRouter)
app.use('/api/v1/youtube', YoutubeRouter)
app.use('/api/v1/facebook', FacebookRouter)
app.use('/api/v1/convert', ConverterRouter)

const PORT = 3000

app.listen(PORT, () => {
  console.log('Server running on http://localhost:3000')
})

export default app
