import express from "express"
import { getFoodInfo, getSingleInfo, getFoodImage } from '../router-handler/food.js'

const router  = express.Router()

router.get('/detail', getFoodInfo)
router.get('/single', getSingleInfo)
router.get('/image/:id', getFoodImage)

export default router 