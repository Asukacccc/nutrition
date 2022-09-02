import express from "express"
import {
    setDietRecipe, uploadImage, getDietRecipe, addRecipeWelcome, getDietRecipeByIdArr,
    getImageSource, getRecipeDetail, getRecipeWelcome, deleteDietRecipe, cancelConfirm, getUserInfoByRecipeId
} from '../router-handler/diet-recipe.js'

const router = express.Router()

router.post('/upload', uploadImage)
router.post('/set', setDietRecipe)
router.get('/total', getDietRecipe)
router.get('/image/:path', getImageSource)
router.get('/detail', getRecipeDetail)
router.get('/welcome', getRecipeWelcome)
router.get('/update-welcome', addRecipeWelcome)
router.get('/delete', deleteDietRecipe)
router.get('/total-id', getDietRecipeByIdArr)
router.get('/cancel-confirm', cancelConfirm)
router.get('/user-info', getUserInfoByRecipeId)

export default router