import express from "express"
import { getAnswerInfo } from '../router-handler/qa-answer.js'

const router = express.Router()

router.get('/get', getAnswerInfo)

export default router