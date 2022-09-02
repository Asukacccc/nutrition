import db from '../database.js'

function getDietInfo(req, res) {
    let queryStr = 'select id, food_id_set, date, time, user_defined from `diet-record` where open_id = ?'

    if (Number(req.query.today)) {
        queryStr += ` and date >= ${ Number(req.query.boundary) }`
    } else {
        queryStr += ` and date < ${ Number(req.query.boundary) }`
    }

    Number(req.query.single) ? queryStr += ` and id = ${ req.query.single }` : ''

    queryStr += ' order by id desc limit ?, ?'

    db.query(queryStr, [req.auth.openid, Number(req.query.start), Number(req.query.length)], (err, queryResult) => {
        if (err) return res.cc(err)
        if (!queryResult.length && Number(req.query.single)) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

function setDietInfo(req, res) {
    const queryStr = 'insert into `diet-record` set ?'
    const insertObj = {
        food_id_set: req.body.foodSet,
        date: req.body.date,
        time: req.body.time,
        open_id: req.auth.openid
    }

    db.query(queryStr, insertObj, (err, insertResult) => {
        if (err) return res.cc(err)
        if (insertResult.affectedRows !== 1) return res.cc('insert fail...')

        res.cc(insertResult.insertId, 0)
    })
}

function updateDietInfo(req, res) {
    const updateObj = {}
    if (req.body.foodSet) updateObj.food_id_set = req.body.foodSet
    if (req.body.date) updateObj.date = req.body.date
    if (req.body.time) updateObj.time = req.body.time

    const queryStr = 'update `diet-record` set ? where id = ? and open_id = ?'

    if(updateObj === {}) return res.cc('there are data need to update...')

    console.log(updateObj, req.auth.openid)

    db.query(queryStr, [updateObj, Number(req.body.id), req.auth.openid], (err, updateResult) => {
        if (err) return res.cc(err)
        if (updateResult.affectedRows !== 1) return res.cc('update fail...')

        res.cc('update success...', 0)
    })
}

function deleteDietInfo(req, res) {
    const queryStr = 'delete from `diet-record` where id = ? and open_id = ?'

    db.query(queryStr, [req.query.id, req.auth.openid], (err, deleteResult) => {
        if (err) return res.cc(err)
        if (deleteResult.affectedRows !== 1) return res.cc('delete fail...')

        res.cc('delete success...', 0)
    })

}

export {
    getDietInfo,
    setDietInfo,
    updateDietInfo,
    deleteDietInfo
}