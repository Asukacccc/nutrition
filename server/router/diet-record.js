import express from "express"
import { getDietInfo, setDietInfo, updateDietInfo, deleteDietInfo } from '../router-handler/diet-record.js'

const router = express.Router()

router.get('/get', getDietInfo)
router.post('/set', setDietInfo)
router.post('/update', updateDietInfo)
router.get('/delete', deleteDietInfo)

export default router 