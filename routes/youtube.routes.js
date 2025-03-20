import { Router } from 'express'
import { YoutubeController } from '../controller/youtube.controller.js'

const YoutubeRouter = Router()

YoutubeRouter.get('/', YoutubeController)

export { YoutubeRouter }
