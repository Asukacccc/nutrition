import db from '../database.js'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { createDir, deleteDir } from '../utils/file-manage.js'
import ffmpeg from 'ffmpeg'
import  { getUserInfo } from './user.js'

const __dirname = path.resolve()
const mainPath = path.resolve(__dirname, '../DataBaseSource/music-source')

function uploadFile(req, res, next) {
    const storage = {
        storage: multer.diskStorage({
            destination: function (req, file, callback) {

                const dirPath = path.resolve(mainPath, './temp')
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true })
                }
                callback(null, dirPath)
            },
            filename: function (req, file, callback) {
                const fileName = req.auth.openid + '-' + new Date().getTime()
                callback(null, fileName)
            }
        })
    }
    let upload = multer(storage).any()
    upload(req, res, (err) => {
        if (err) return res.cc(err)
        next()
    })
}

function continueUpload(req, res) {
    const uploadPath = path.join(mainPath, req.query.hash, '/')

    db.query('select * from `sleep-music`', (err, queryResult) => {
        if (err) return res.cc(err)

        const baseHashArray = queryResult.map(item => item.source)
        const hasSameFile = baseHashArray.find(item => item.indexOf(req.query.hash) !== -1)

        if (hasSameFile) {
            res.cc(-1, 0)
        } else {
            try {
                const result = fs.readdirSync(uploadPath)
                res.cc(result.length, 0)
            } catch (error) {
                res.cc(0, 0)
            }
        }
    })

}

function sourceSave(req, res) {
    if (Number(req.body.done)) return saveSourceInfoToBase(req, res, path.join(mainPath, req.body.name))

    const { hash, index, total } = req.body

    if (hash && index) {
        const savePath = path.join(mainPath, hash, '/')

        if (!fs.existsSync(savePath)) createDir(savePath)

        fs.renameSync(req.files[0].path, savePath + hash + '-' + index)

        if (Number(total) === Number(index) + 1) {
            setMusicVideo(req, res)
        } else {
            res.cc('fragment upload success...', 0)
        }
    } else {
        fs.renameSync(req.files[0].path, path.join(mainPath, req.body.name))
        res.cc('upload success...')
    }
}

function saveSourceInfoToBase(req, res, filePath = '') {
    const queryStr = 'insert into `sleep-music` set ?'
    let source

    if (Number(req.body.isPicture)) {
        source = path.join(mainPath, req.body.imageName) + ',' + path.join(mainPath, req.body.audioName)
    } else {
        source = filePath + ',' + path.join(mainPath, req.body.thumb)
    }
    
    const insertObj = {
        title: req.body.title,
        singer: req.body.singer,
        avatar: req.body.avatar,
        source,
        is_picture: req.body.isPicture,
        open_id: req.auth.openid,
        time: req.body.time,
        nickname: req.body.nickname
    }

    db.query(queryStr, insertObj, (err, insertResult) => {
        if (err) return res.cc(err)
        if (insertResult.affectedRows !== 1) return res.cc('insert fail...')

        res.cc('insert success...', 0)
    })
}

function setMusicVideo(req, res) {
    const { total, hash, name } = req.body

    const finalFilePath = path.join(mainPath, name)
    const savePath = path.join(mainPath, hash, '/')
    const chunks = fs.readdirSync(savePath)
    const tempPath = path.resolve(mainPath, './temp')

    fs.writeFileSync(finalFilePath, '')
    if (Number(total) !== chunks.length) {
        return res.cc('chunks count not match...')
    }

    for (let i = 0; i < total; i++) {
        fs.appendFileSync(finalFilePath, fs.readFileSync(savePath + hash + '-' + i))
        fs.unlinkSync(savePath + hash + '-' + i)
    }

    fs.rmdir(savePath, err => {
        if (err) return res.cc(err)
    })

    fs.readdir(tempPath, (err, result) => {
        if (err) return res.cc(err)
        result = result.filter(item => item.split('-')[0] === req.auth.openid)
        result.forEach(item => {
            fs.unlinkSync(path.join(tempPath, item))
        })
    })

    saveSourceInfoToBase(req, res, finalFilePath)
}

function getTotalSleepMusic(req, res) {
    let queryStr = 'select avatar, title, singer, id, is_picture, nickname, time from `sleep-music`'
    const queryLength = Number(req.query.length)
    const queryStart = Number(req.query.start)

    if (Number(req.query.self)) {
        queryStr += ` where open_id = '${req.auth.openid}'`
        queryStr += ' order by time desc'
        queryStr += ` limit ${queryStart}, ${queryLength}`

    } else {
        if (!Number(req.query.boundary)) {
            queryStr +=  ` where time > '${ req.query.boundary }' order by time desc limit ${ req.query.start }, ${ req.query.length }`
        } else {
            queryStr += ` where time > '${ req.query.boundary }' limit ${ req.query.start }, ${ req.query.length }`
        }
    }

    db.query(queryStr, (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })

}

function getMusicSource(req, res) {
    const queryStr = 'select source, is_picture from `sleep-music` where id = ?'

    db.query(queryStr, req.params.id, (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        const source = queryResult[0].source
        const sourceArray = source.split(',')

        if (Number(queryResult[0].is_picture)) {
            if (req.params.type === 'image') {
                res.sendFile(sourceArray[0])
            } else {
                res.sendFile(sourceArray[1])
            }
        } else {
            if (req.params.type === 'cover') {
                res.sendFile(sourceArray[1])
            } else {
                const fileSize = fs.statSync(sourceArray[0]).size
                const readStream = fs.createReadStream(sourceArray[0])

                res.header('Content-Range', 'bytes chunkStart-chunkEnd/chunkSize')
                res.header('Accept-Ranges', 'bytes')
                res.header('Content-Type', 'video/webm')
                res.header('Content-Length', fileSize)
                readStream.pipe(res)
            }
        }
    })
}

function deleteSleepMusic(req, res) {
    const deleteQueryStr = 'delete from `sleep-music` where id = ? and open_id = ?'
    const findQueryStr = 'select source, is_picture from `sleep-music` where id = ? and open_id = ?'
    const deleteWelcomeRecord = 'delete from `welcome-manage` where music_id = ?'
    let flag = true
    let videoDeleteErr = ''

    db.query(findQueryStr, [req.query.id, req.auth.openid], (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        if (Number(queryResult[0].is_picture)) {
            const path_1 = queryResult[0].source.split(',')[0]
            const path_2 = queryResult[0].source.split(',')[1]

            fs.unlinkSync(path_1)
            fs.unlinkSync(path_2)
        } else {
            const saveQueryStr = 'select * from `sleep-music` where source = ?'

            db.query(saveQueryStr, queryResult[0].source, (err, saveResult) => {
                if (err) return res.cc(err)
                if (saveResult.length === 0) return videoDeleteErr = 'file not exist'

                if (saveResult.length === 1) {
                    fs.unlink(queryResult[0].source, err => {
                        return videoDeleteErr = err
                    })
                } else flag = false
            })
        }

        if (videoDeleteErr) return res.cc(videoDeleteErr)

        function deleteHandler(str) {
            return new Promise((resolve, reject) => {
                db.query(str, [req.query.id, req.auth.openid], (err, deleteResult) => {
                    if (err) return reject(err)
                    if (deleteResult.affectedRows > 1) return reject('delete fail...')

                    resolve()
                })
            })
        }

       Promise.all([deleteHandler(deleteQueryStr), deleteHandler(deleteWelcomeRecord)]).then(
           () => {
                res.cc(flag ? 'delete success...' : 'file save...', 0)
           },
           err => {
               res.cc(err)
           }
       )
    })
}

function deleteWelcomeRecord(req, res, cancel = true) {
    const deleteWelcome = 'delete from `welcome-manage` where music_id = ? and open_id = ?'
    db.query(deleteWelcome, [req.query.id, req.auth.openid], (err, deleteResult) => {
        if (err) return res.cc(err)
        if (deleteResult.affectedRows !== 1) return res.cc('delete welcome record fail...')

        res.cc(cancel ? 'cancel success...' : 'delete success', 0)
    })
}

function cancelConfirm(req, res) {
    deleteWelcomeRecord(req, res)
}

function addMusicWelcome(req, res) {
    let variable = 1
    const checkIsClick = 'select * from `welcome-manage` where music_id = ? and open_id = ?'

    db.query(checkIsClick, [req.query.id, req.auth.openid], (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 1) variable = -1

        if (variable === 1) {
            const updateWelcome = 'insert into `welcome-manage` set ?'
            db.query(updateWelcome, { music_id: req.query.id, open_id: req.auth.openid }, (err, insertResult) => {
                if (err) return res.cc(err)
                if (insertResult.affectedRows !== 1) return res.cc('insert welcome record fail...')

                res.cc('fond success...', 0)
            })
        }
        else {
            deleteWelcomeRecord(req, res, false)
        }
    })

}

function getMusicWelcome(req, res) {
    const queryStr = 'select * from `welcome-manage` where music_id = ?'

    db.query(queryStr, req.query.id, (err, queryResult) => {
        if (err) return res.cc(err)

        const self = queryResult.some(v => v.open_id === req.auth.openid)

        res.cc({ length: queryResult.length, confirm: self }, 0)
    })
}

function getSleepMusicByIdArray(req, res) {
    let baseStr = 'select avatar, title, singer, id, is_picture, nickname from `sleep-music` where id = ?'
    const reqArr = req.query.arr

    for (let i = 1; i < reqArr.length; i ++) {
        baseStr += ' or id = ?'
    }

    db.query(baseStr, reqArr, (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        return res.cc(queryResult, 0)
    })
}

function getUserInfoByMusicId(req, res) {
    const openIdQueryStr = 'select open_id from `sleep-music` where id = ?'

    db.query(openIdQueryStr, Number(req.query.id), (err, result) => {
        if (err) return res.cc(err)
        if (!result.length) return res.cc('unknown error...')

        req.temp = result[0].open_id

        getUserInfo(req, res)
    })
}

export {
    sourceSave,
    uploadFile,
    continueUpload,
    getMusicSource,
    getTotalSleepMusic,
    deleteSleepMusic,
    addMusicWelcome,
    getMusicWelcome,
    getSleepMusicByIdArray,
    cancelConfirm,
    saveSourceInfoToBase,
    getUserInfoByMusicId
}