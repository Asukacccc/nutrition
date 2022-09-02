import fly from 'flyio'
import tokenConfig from '../config/token.js'
import jwt from 'jsonwebtoken'
import db from '../database.js'
import { appSecret, appId } from '../config/weixin.js'
import multer from "multer"
import path from 'path'
import fs from "fs";

const avatarSavePath = path.join(path.resolve(), '../DataBaseSource/user-avatar/')
const feedbackPath = path.join(path.resolve(), '../DataBaseSource/feedback')

async function getOpenId(req, res) {
    const userCode = req.body.code
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${userCode}&grant_type=authorization_code`

    const serverResult = await fly.get(url)
    const openid = JSON.parse(serverResult.data).openid

    if (!openid) {
        return res.cc('code required...')
    }

    const tokenStr = jwt.sign({ openid }, tokenConfig.secretKey, { expiresIn: tokenConfig.expiresIn })

    res.send({
        message: 'login success',
        status: 0,
        token: 'Bearer ' + tokenStr
    })

}

function getInfoByBase(req, res) {
    return new Promise(resolve => {
        const queryStr = 'select * from `user-info` where open_id = ?'

        db.query(queryStr,  req.temp ||req.auth.openid, (err, queryResult) => {
            if (err) return res.cc(err)
            resolve(queryResult)
        })
    })
}

function getUserReleaseCount(req, res) {
    const sendContent = {}

    function getDataFromBase(openId) {
        const queryA = 'select * from `sleep-music` where open_id = ?'
        const queryB = 'select * from `diet-recipe` where open_id = ?'

        db.query(queryA, [openId], (errA, resultA) => {
            if (errA) return res.cc(errA)
            sendContent['sleep'] = resultA.length

            db.query(queryB, [openId], (errB, resultB) => {
                if (errB) return res.cc(errB)
                sendContent['recipe'] = resultB.length

                res.send(sendContent)
            })
        })
    }

    if (req.query.id) {
        const queryStr = Number(req.query.isMusic) ?
            'select open_id from `sleep-music` where id = ?' :
            'select open_id from `diet-recipe` where id = ?'

        db.query(queryStr, req.query.id, (err, result) => {

            if (err) return res.cc(err)
            if (result.length === 0) return res.cc('no data...')

            getDataFromBase(result[0].open_id)
        })
    } else {
        getDataFromBase(req.auth.openid)
    }
}

async function getUserInfo(req, res) {
    const result = await getInfoByBase(req, res)

    if (result.length !== 1) return res.cc('user not exist...')

    let { avatar, nickname, sign } = result[0]

    res.cc({ avatar, nickname, sign }, 0)
}

function getUserAvatar(req, res) {
    const isExist = fs.existsSync(path.join(avatarSavePath, req.params.src))

    if (!isExist) return res.cc('avatar not exists...')

    res.sendFile(path.join(avatarSavePath, req.params.src))
}

function updateUserAvatar(req, res) {

    function updateTable(insertStr) {

        db.query(insertStr, [req.avatarPath, req.auth.openid], (err, updateResult) => {
            if (err) return res.cc(err)
        })
    }

    const queryStr = 'select avatar from `user-info` where open_id = ?'

    db.query(queryStr, req.auth.openid, (err, result) => {
        if (err) return res.cc(err)
        if (result.length === 0) return console.log('user not exist...')

        clearOldAvatar(result[0].avatar, avatarSavePath)

        updateTable('update `user-info` set avatar = ? where open_id = ?')
        updateTable('update `sleep-music` set avatar = ? where open_id = ?')
        updateTable('update `diet-recipe` set avatar = ? where open_id = ?')

        res.cc('update success...', 0)
    })
}

function clearOldAvatar(filename, src) {
    fs.readdir(src, (err, list) => {
        if (err) return console.log(err.message)
        list.some(item => {
            if (item === filename) {
                fs.unlink(path.join(src, item), err => { if (err) return console.log(err) })
                return true
            }
        })
    })
}

function avatarImageReceive(req, res, next) {
    const storage = {
        storage: multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, avatarSavePath)
            },
            filename: function (req, file, callback) {
                const currentTime = new Date().getTime()
                const fileName = currentTime + path.extname(file.originalname)

                req.avatarPath = fileName
                callback(null, fileName)
            }
        })
    }
    let upload = multer(storage).single('avatar')
    upload(req, res, (err) => {
        if (err) return res.cc(err)
        next()
    })
}

async function setUserInfo(req, res) {

    const userObj = {}
    userObj.open_id = req.auth.openid

    if (req.body.avatar) userObj.avatar = req.body.avatar
    if (req.body.nickname) userObj.nickname = req.body.nickname
    if (req.body.sign) userObj.sign = req.body.sign

    const result = await getInfoByBase(req, res)

    if (result.length === 0) {
        const queryStr = 'insert into `user-info` set ?'

        db.query(queryStr, userObj, (err, insertResult) => {
            if (err) return res.cc(err)
            if (insertResult.affectedRows !== 1) return res.cc('insert fail...')

            res.cc('insert success', 0)
        })
    } else if (result.length === 1) {
        const queryStr = 'update `user-info` set ? where open_id = ?'

        db.query(queryStr, [userObj, userObj.open_id], (err, updateResult) => {
            if (err) return res.cc(err)
            if (updateResult.affectedRows !== 1) return res.cc('update fail...')

            res.cc('update success...', 0)
        })
    } else {
        res.cc('data find fail...')
    }

}

function setFeedback(req, res) {
    const queryStr = 'insert into feedback set ?'
    const insertObj = {
        date: req.body.date,
        problem: req.body.problem,
        open_id: req.auth.openid,
        image_count: req.body.count || 0
    }

    db.query(queryStr, insertObj, (err, result) => {
        if (err) return res.cc(err)
        if (result.affectedRows !== 1) return res.cc('insert into data error... ')

        res.cc('insert into success...', 0)
    })
}

function feedbackImageUpload(req, res) {
    const storage = {
        storage: multer.diskStorage({
            destination: function (req, file, callback) {
                const dirPath = feedbackPath
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }
                callback(null, dirPath);
            },
            filename: function (req, file, callback) {

                const fileName = req.body.date + '-' + req.body.index + '.' + req.body.extraName
                callback(null, fileName);
            }
        })
    }
    let upload = multer(storage).single('feedback')
    upload(req, res, (err) => {
        if (err) return res.cc(err)
        res.cc('upload success...', 0)
    })
}

function getFeedback(req, res) {
    let queryStr = 'select id, date, problem, respond, image_count from feedback where open_id = ?'

    if (Number(req.query.boundary)) {
        queryStr += ` and date > '${ req.query.boundary }'`
        queryStr += ' limit ?, ?'
    } else {
        queryStr += ' order by date desc limit ?, ?'
    }

    db.query(queryStr, [req.auth.openid, Number(req.query.start), Number(req.query.length)], (err, result) => {
        if (err) return res.cc(err)

        res.cc(result, 0)
    })
}

function getFeedbackImage(req, res) {
    fs.readdir(feedbackPath, (err, result) => {
        if (err) return console.log(err)
        for (let i of result) {
            if (i.indexOf(req.params.src) !== -1) {
                return res.sendFile(path.join(feedbackPath, i))
            }
        }
    })
}

function getUserWelcome(req, res) {
    const queryStr = 'select music_id, recipe_id from `welcome-manage` where open_id = ?'

    db.query(queryStr, req.auth.openid, (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

export {
    getOpenId,
    getUserInfo,
    setUserInfo,
    getUserReleaseCount,
    setFeedback,
    getFeedback,
    updateUserAvatar,
    avatarImageReceive,
    getUserAvatar,
    getUserWelcome,
    feedbackImageUpload,
    getFeedbackImage
}