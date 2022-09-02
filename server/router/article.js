import { getArticleInfo, getArticleContent } from '../router-handler/article.js'

import express from 'express'

const router = express.Router()

router.get('/get', getArticleInfo)
router.get('/content', getArticleContent)
router.get('/collection')

export default router

