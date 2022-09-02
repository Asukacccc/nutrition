import { getJournal, setJournal, deleteJournal } from '../router-handler/diet-journal.js'
import express from 'express'

const router = express.Router()

router.get('/get', getJournal)
router.post('/set', setJournal)
router.get('/delete', deleteJournal)

export default router