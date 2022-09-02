import express from "express"
import { getImageSource } from '../router-handler/source.js'

const router = express.Router()

router.get('/get/:path', getImageSource)

export default router