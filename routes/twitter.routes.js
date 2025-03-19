import { Router } from 'express'
import { TwitterController } from '../controller/twitter.controller.js'

const TwitterRouter = Router()

TwitterRouter.get('/', TwitterController)

export { TwitterRouter }
