import { Router } from 'express'
import { YoutubeController } from '../controller/Youtube.controller.js'

const YoutubeRouter = Router()

YoutubeRouter.get('/', YoutubeController)

export { YoutubeRouter }
