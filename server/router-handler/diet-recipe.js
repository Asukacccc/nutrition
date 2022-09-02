import db from '../database.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import  { getUserInfo } from './user.js'

const __dirname = path.resolve()
const basePath = path.join(__dirname, '../DataBaseSource/recipe-source')

function setDietRecipe(req, res) {
    let { text } = req.body
    const { config } = req.body
    const configArray = config.split('')
    const contentPath = path.join(basePath, './' + req.body.time + '.xml')
    const imageRealPath = req.body.imageName

    fs.appendFileSync(contentPath, '<content>', err => {
        if (err) return res.cc(err)
    })

    let currentIndex = 0

    for (let i = 0; i < configArray.length; i++) {
        if (!text[i]) break

        let content = `<item><p>${text[i]}</p>`
        if (Number(configArray[i])) {
            content += `<img>${imageRealPath[currentIndex ++]}</img>`
        }
        content += '</item>'
        fs.appendFileSync(contentPath, content, err => { if (err) return res.cc(err) })
    }

    fs.appendFileSync(contentPath, '</content>', err => { if (err) return res.cc(err) })

    const queryStr = 'insert into `diet-recipe` set ?'

    const insertObj = {
        avatar: req.body.avatar,
        source: contentPath.split(basePath + '\\')[1],
        open_id: req.auth.openid,
        title: req.body.title,
        cover: !imageRealPath[0] ? '' : imageRealPath[0],
        time: req.body.time,
        nickname: req.body.nickname
    }

    db.query(queryStr, insertObj, (err, insertResult) => {
        if (err) return res.cc(err)
        if (insertResult.affectedRows !== 1) return res.cc('insert fail...')

        res.cc('insert success...', 0)
    })
}

function uploadImage(req, res) {
    const storage = {
        storage: multer.diskStorage({
            destination(req, file, callback) {
                const imagePath = path.join(basePath, './image')
                if (!fs.existsSync(imagePath)) fs.mkdirSync(imagePath, { recursive: true })
                callback(null, imagePath)
            },
            filename(req, file, callback) {
                const fileName = new Date().getTime() + path.extname(file.originalname)
                callback(null, fileName)
            }
        })
    }
    const upload = multer(storage).single('image')
    upload(req, res, err => {
        if (err) return res.cc(err)
        
        try {
            fs.renameSync(req.file.path, path.join(basePath, './image/', req.body.name))
            res.cc('upload success...', 0)
        } catch (e) {
            res.cc(e.message, 1)
        }
    })
}

function getDietRecipe(req, res) {
    const pageLength = Number(req.query.length)
    const start = Number(req.query.start)
    let queryStr = 'select avatar, time, title, cover, id, source, nickname from `diet-recipe`'

    if (Number(req.query.self)) {
        queryStr += ` where open_id = '${req.auth.openid}'`
        queryStr += ' order by time desc'
        queryStr += ` limit ${start}, ${pageLength}`

    } else {
        if (!Number(req.query.boundary)) {
            queryStr +=  ` where time > '${ req.query.boundary }' order by time desc limit ${ req.query.start }, ${ req.query.length }`
        } else {
            queryStr += ` where time > '${ req.query.boundary }' limit ${ req.query.start }, ${ req.query.length }`
        }
    }

    db.query(queryStr, [start, pageLength], (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

function getDietRecipeByIdArr(req, res) {
    let baseStr = 'select avatar, time, title, cover, id, source, nickname from `diet-recipe` where id = ?'
    const arr = req.query.arr

    for (let i = 1; i < arr.length; i ++) {
        baseStr += ' or id = ?'
    }

    db.query(baseStr, arr, (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

function getImageSource(req, res) {
    const imagePath = path.join(basePath, './image', req.params.path)
    
    res.sendFile(imagePath)
}

function getRecipeDetail(req, res) {
    fs.readFile(path.join(basePath, req.query.source), (err, data) => {
        if (err) return res.cc(err)
        const result = data.toString().match(/(?<=<item>)[\s\S]*?(?=<\/item>)/g)
        const resArray = []

        result.forEach((item, i) => {
            resArray[i] = {}
            resArray[i].text = item.match(/(?<=<p>)[\s\S]*(?=<\/p>)/)[0]
            resArray[i].imgSrc = item.match(/(?<=<img>)[\s\S]*(?=<\/img>)/) ? item.match(/(?<=<img>)[\s\S]*(?=<\/img>)/)[0] : ''
        })

        res.cc(resArray, 0)
    })
}

function deleteDietRecipe(req, res) {
    const queryStr = 'delete from `diet-recipe` where id = ? and open_id = ?'
    const deleteWelcome = 'delete from `welcome-manage` where recipe_id = ?'
    const getSource = 'select source from `diet-recipe` where id = ? and open_id = ?'

    db.query(getSource, [req.query.id, req.auth.openid], (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 0) return res.cc('no data...')

        const time = queryResult[0].source.split('.xml')[0]

        fs.unlink(path.join(basePath, queryResult[0].source), err => {
            if (err) return console.log(err)
        })

        fs.readdir(path.join(basePath, './image/'), (err, files) => {
            if (err) return console.log(err)
            files.forEach(item => {
                if (item.indexOf(String(time)) !== -1) fs.unlink(path.join(basePath, './image/', item), err => { if (err) return res.cc(err) })
            })
        })

        db.query(queryStr, [req.query.id, req.auth.openid], (err, deleteResult) => {
            if (err) return res.cc(err)
            if (deleteResult.affectedRows > 1) return res.cc('delete fail...')

            db.query(deleteWelcome, [req.query.id, req.auth.openid], (err, deleteResult) => {
                if (err) return res.cc(err)
                if (deleteResult.affectedRows > 1) return res.cc('delete fail...')

                res.cc('delete success...', 0)
            })
        })
    })
}

function deleteWelcomeRecord(req, res, cancel = true) {
    const deleteWelcome = 'delete from `welcome-manage` where recipe_id = ? and open_id = ?'
    db.query(deleteWelcome, [req.query.id, req.auth.openid], (err, deleteResult) => {
        if (err) return res.cc(err)
        if (deleteResult.affectedRows !== 1) return res.cc('delete welcome record fail...')

        res.cc(cancel ? 'cancel success...' : 'delete confirm...', 0)
    })
}

function cancelConfirm(req, res) {
    deleteWelcomeRecord(req, res)
}

function addRecipeWelcome(req, res) {
    let variable = 1
    const checkIsClick = 'select * from `welcome-manage` where recipe_id = ? and open_id = ?'

    db.query(checkIsClick, [req.query.id, req.auth.openid], (err, queryResult) => {
        if (err) return res.cc(err)
        if (queryResult.length === 1) variable = -1

        if (variable === 1) {
            const updateWelcome = 'insert into `welcome-manage` set ?'
            db.query(updateWelcome, { recipe_id: req.query.id, open_id: req.auth.openid }, (err, insertResult) => {
                if (err) return res.cc(err)
                if (insertResult.affectedRows !== 1) return res.cc('insert welcome record fail...')

                res.cc('update success...', 0)
            })
        }
        else {
            deleteWelcomeRecord(req, res, false)
        }
    })
}

function getRecipeWelcome(req, res) {
    const queryStr = 'select * from `welcome-manage` where recipe_id = ?'

    db.query(queryStr, req.query.id, (err, queryResult) => {
        if (err) return res.cc(err)

        const self = queryResult.some(v => v.open_id === req.auth.openid)

        res.cc({ length: queryResult.length, confirm: self }, 0)
    })
}

function getUserInfoByRecipeId(req, res) {
    const openIdQueryStr = 'select open_id from `diet-recipe` where id = ?'

    db.query(openIdQueryStr, Number(req.query.id), (err, result) => {
        if (err) return res.cc(err)
        if (!result.length) return res.cc('unknown error...')

        getUserInfo(req, res)
    })
}

export {
    setDietRecipe,
    uploadImage,
    getDietRecipe,
    getImageSource,
    getRecipeDetail,
    getRecipeWelcome,
    addRecipeWelcome,
    deleteDietRecipe,
    getDietRecipeByIdArr,
    cancelConfirm,
    getUserInfoByRecipeId
}