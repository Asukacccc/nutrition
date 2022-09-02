import db from '../database.js'

function getEvaluationInfo(req, res) {
    const queryStr = 'select * from qa_evaluation'

    db.query(queryStr, (err, result) => {
        if (err) return res.cc(err)

        res.cc(result[0], 0)
    })
}

export {
    getEvaluationInfo
}