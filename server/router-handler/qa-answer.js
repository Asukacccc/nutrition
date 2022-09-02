import db from '../database.js'

function getAnswerInfo(req, res) {
    const foodStr = 'select * from `qa_answer`'

    db.query(foodStr, (err, result) => {
        if (err) return res.cc(err)

        const length = result.length
        const random = Math.random()

        const index = Math.floor(random / (1 / length))

        res.cc(result[index], 0)
    })
}

export {
    getAnswerInfo
}