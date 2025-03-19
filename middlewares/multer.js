import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear la carpeta "uploads" si no existe
const uploadPath = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

// Configurar almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath) // Guardar en ../uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) // Obtener la extensión del archivo
    const uniqueName = `${Date.now()}${ext}` // Crear un nombre único
    cb(null, uniqueName)
  }
})

const upload = multer({ storage })

export default upload
