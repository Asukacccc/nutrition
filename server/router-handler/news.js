import db from '../database.js'
import fs from 'fs'

function getArticle(req, res) {
    const queryStr = 'select * from article'
    db.query(queryStr, (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')
        
        res.send(queryResult)
    })
}

function getArticleDetail(req, res) {
    const articlePath = req.params.path
    res.sendFile(articlePath)
}

function getEvaluationQuestion(req, res) {
    const queryStr = 'select * from questionnaire'
    db.query(queryStr, (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        res.send(queryResult)
    })
}

function getQuestionAndAnswer(req, res) {
    const queryStr = 'select * from `question-answer`'
    db.query(queryStr, (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        res.send(queryResult)
    })
}

export {
    getArticle,
    getArticleDetail,
    getEvaluationQuestion,
    getQuestionAndAnswer
}
