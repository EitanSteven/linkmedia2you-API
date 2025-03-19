import { Router } from 'express'
import { ConverterController } from '../controller/converter.controller.js'
import upload from '../middlewares/multer.js'

const ConverterRouter = Router()

ConverterRouter.post('/', upload.single('file'), ConverterController)

export { ConverterRouter }
