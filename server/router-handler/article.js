import db from '../database.js'

function getArticleInfo(req, res) {
    const str = 'select title, _id, number, more_title from qa_article '

    db.query(str, (err, result) => {
        if (err) return res.cc(err)

        res.cc(result, 0)
    })
}

function getArticleContent(req, res) {
    const queryStr = 'select * from qa_article where _id = ?'

    db.query(queryStr, req.query._id, (err, result) => {
        if (err) return res.cc(err)

        res.cc(result, 0)
    })
}

export {
    getArticleInfo,
    getArticleContent
}