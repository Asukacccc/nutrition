import express from "express"
import { getEvaluationInfo } from '../router-handler/qa_evaluation.js'

const router = express.Router()

router.get('/get', getEvaluationInfo)

export default router