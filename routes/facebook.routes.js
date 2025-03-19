import { Router } from 'express'
import { FacebookController } from '../controller/facebook.controller.js'

const FacebookRouter = Router()

FacebookRouter.get('/', FacebookController)

export { FacebookRouter }
