import express from "express"
import { getSearchResult } from '../router-handler/search.js'

const router = express.Router()

router.get('/:search', getSearchResult)

export default router