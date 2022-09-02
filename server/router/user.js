import express from "express"
import { getOpenId, getUserInfo, getFeedbackImage, setUserInfo, getUserAvatar, getUserReleaseCount, getUserWelcome, setFeedback, getFeedback, updateUserAvatar, avatarImageReceive, feedbackImageUpload } from '../router-handler/user.js'

const router = express.Router()

router.post('/open', getOpenId)
router.get('/get', getUserInfo)
router.post('/set', setUserInfo)
router.get('/count', getUserReleaseCount)
router.post('/set-feedback', setFeedback)
router.post('/set-feedback-image', feedbackImageUpload)
router.get('/get-feedback-image/:src', getFeedbackImage)
router.get('/get-feedback', getFeedback)
router.post('/avatar', avatarImageReceive, updateUserAvatar)
router.get('/get-avatar/:src', getUserAvatar)
router.get('/fond', getUserWelcome)

export default router