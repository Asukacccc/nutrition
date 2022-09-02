import express from "express"
import cors from 'cors'
import { expressjwt } from 'express-jwt'
import news from './router/news.js'
import food from './router/food.js'
import user from './router/user.js'
import tokenConfig from './config/token.js'
import sleepRecord from './router/sleep-record.js'
import dietRecord from './router/diet-record.js'
import sleepMusic from './router/sleep-music.js'
import dietRecipe from './router/diet-recipe.js'
import search from './router/search.js'
import dietJournal from './router/diet-journal.js'
import pictureSource from './router/source.js'
import article from './router/article.js'
import qaFood from './router/qa-food.js'
import qaAnswer from "./router/qa-answer.js"
import evaluationInfo from './router/qa_evaluation.js'

const app = express()

app.use(cors())
app.use(express.json(), express.urlencoded({ extended: false }))
app.use((req, res, next) => {
    res.cc = (err, status = 1) => {
        res.send({
            message: err instanceof Error ? err.message : err,
            status
        })
    }
    next()
})
app.use(expressjwt({ secret: tokenConfig.secretKey, algorithms: ['HS256'] }).unless({
    path: [/^\/user\/open/, /^\/picture\/get/,/^\/sleep-music\/source/, /^\/diet-recipe\/image?/, /^\/search\//, /^\/user\/get-feedback-image/, /^\/user\/get-avatar/, /^\/food\/image/]
}))

app.use('/news', news)
app.use('/food', food)
app.use('/user', user)
app.use('/sleep-record', sleepRecord)
app.use('/diet-record', dietRecord)
app.use('/sleep-music', sleepMusic)
app.use('/diet-recipe', dietRecipe)
app.use('/search', search)
app.use('/diet-journal', dietJournal)
app.use('/picture', pictureSource)
app.use('/article', article)
app.use('/food-detail', qaFood)
app.use('/answer', qaAnswer)
app.use('/evaluation', evaluationInfo)

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") return res.cc("Certification fail")
    res.cc(err)
})
app.listen(80, () => { console.log('server running now') })