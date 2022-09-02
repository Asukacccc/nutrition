import db from '../database.js'

function getSleepInfo(req, res) {
    let queryStr = 'select sleep_interval, respite, id from `sleep-record` where open_id = ?'

    if (Number(req.query.today)) {
        queryStr += ` and substring(sleep_interval, 1, 13) >= ${ Number(req.query.boundary) }`
    } else {
        queryStr += ` and substring(sleep_interval, 1, 13) < ${ Number(req.query.boundary) }`
    }

    queryStr += ' order by id desc limit ?, ?'

    db.query(queryStr, [req.auth.openid, req.query.start - 0, req.query.length - 0], (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

function setSleepInfo(req, res) {
    const queryStr = 'insert into `sleep-record` set ?'
    const insertObj = {
        sleep_interval: req.body.sleepInterval,
        respite: req.body.respite,
        open_id: req.auth.openid
    }

    db.query(queryStr, insertObj, (err, insertResult) => {
        if (err) return res.cc(err)
        if (insertResult.affectedRows !== 1) res.cc('insert fail...')

        res.cc(insertResult.insertId, 0)
    })
}

function updateSleepInfo(req, res) {
    const updateObj = {}
    if (req.body.date) updateObj.date = req.body.date
    if (req.body.respite) updateObj.respite = req.body.respite
    if (req.body.sleep_interval) updateObj.sleepInterval = req.body.sleep_interval

    const queryStr = 'update `sleep-record` set ? where id = ? and open_id = ?'
    
    db.query(queryStr, [updateObj, req.body.id, req.auth.openid], (err, updateResult) => {
        if (err) return res.cc(err)
        if (updateResult.affectedRows !== 1) return res.cc('update fail...')

        res.cc('update success...', 0)
    })
}

function deleteSleepInfo(req, res) {
    const queryStr = 'delete from `sleep-record` where id = ? and open_id = ?'

    db.query(queryStr, [req.query.id, req.auth.openid], (err, deleteResult) => {
        if (err) return res.cc(err)
        if (deleteResult.affectedRows !== 1) return res.cc('delete fail...')

        res.cc('delete success...', 0)
    })
}

export {
    getSleepInfo,
    setSleepInfo,
    updateSleepInfo,
    deleteSleepInfo
}