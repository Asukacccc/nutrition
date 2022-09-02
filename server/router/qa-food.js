import express from "express"
import { getSearchResult, getClassification } from '../router-handler/qa-food.js'

const router = express.Router()

router.get('/search/:search', getSearchResult)
router.get('/get', getClassification)

export default router