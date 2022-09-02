import db from '../database.js'

function getSearchResult(req, res) {
    const foodStr = 'select * from `food-info` where name like ?'

    db.query(foodStr, '%' + req.params.search + '%', (err, foodResult) => {
        if (err) return res.cc(err)

        res.cc(foodResult, 0)
    })
}

export {
    getSearchResult
}