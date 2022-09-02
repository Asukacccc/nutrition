import express from "express"
import { getArticle, getArticleDetail, getEvaluationQuestion, getQuestionAndAnswer } from '../router-handler/news.js'

const router = express.Router()

router.get('/article', getArticle)
router.get('/article/detail/:path', getArticleDetail)
router.get('/evaluation', getEvaluationQuestion)
router.get('/question', getQuestionAndAnswer)

export default router