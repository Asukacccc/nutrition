import express from "express"
import {
    sourceSave, uploadFile, continueUpload, getMusicWelcome, getSleepMusicByIdArray, saveSourceInfoToBase,
    getTotalSleepMusic, getMusicSource, deleteSleepMusic, addMusicWelcome, cancelConfirm, getUserInfoByMusicId
} from '../router-handler/sleep-music.js'

const router = express.Router()

router.post('/upload', uploadFile, sourceSave)
router.get('/upload', continueUpload)
router.get('/total', getTotalSleepMusic)
router.get('/source/:id/:type', getMusicSource)
router.get('/delete', deleteSleepMusic)
router.get('/update-welcome', addMusicWelcome)
router.get('/welcome', getMusicWelcome)
router.get('/total-id', getSleepMusicByIdArray)
router.get('/cancel-confirm', cancelConfirm)
router.post('/save', saveSourceInfoToBase)
router.get('/user-info', getUserInfoByMusicId)

export default router