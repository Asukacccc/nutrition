import express from "express"
import { getSleepInfo, setSleepInfo, updateSleepInfo, deleteSleepInfo } from '../router-handler/sleep-record.js'

const router = express.Router()

router.get('/get', getSleepInfo)
router.post('/set', setSleepInfo)
router.post('/update', updateSleepInfo)
router.get('/delete', deleteSleepInfo)

export default router