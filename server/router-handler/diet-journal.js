import db from '../database.js'

function getJournal(req, res) {
    const queryStr = 'select option_record, text_record, time from `diet-journal` where record_id = ?'

    db.query(queryStr, req.query.id, (err, result) => {
        if (err) return res.cc(err)

        res.cc(result, 0)
    })
}

function setJournal(req, res) {
    const queryStr = 'insert into `diet-journal` set ?'
    const insertObj = {
        option_record: req.body.option,
        text_record: req.body.text,
        open_id: req.auth.openid,
        time: req.body.time,
        record_id: req.body.record
    }

    db.query(queryStr, insertObj, (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc('insert into fail...')

        return res.cc('insert into success...', 0)
    })
}

function deleteJournal(req, res) {
    const queryStr = 'delete from `diet-journal` where open_id = ? and id = ?'

    db.query(queryStr, [req.auth.openid, req.query.id], (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc('delete fail...')

        res.cc('delete success...', 0)
    })
}

export {
    getJournal,
    setJournal,
    deleteJournal
}