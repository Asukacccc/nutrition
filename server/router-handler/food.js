import db from '../database.js'
import path from "path"

const imageBasePath = path.join(path.resolve(), '../DataBaseSource/recipe-source/food-info-image')

function getFoodInfo(req, res) {
    const sort = req.query.sort
    const queryPage = Number(req.query.start)
    const queryLength = Number(req.query.length)
    const argsArray = [sort, queryPage, queryLength]
    const queryStr = 'select * from `food-info` where sort = ? limit ?, ?'

    db.query(queryStr, argsArray, (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult, 0)
    })
}

function getSingleInfo(req, res) {
    const queryStr = 'select id, name, unit, heat, sort, total_sort from `food-info` where id = ?'

    db.query(queryStr, req.query.id, (err, queryResult) => {
        if (err) return res.cc(err)

        res.cc(queryResult[0], 0)
    })
}

function getFoodImage(req, res) {
    const queryStr = 'select image_path from `food-info` where id = ?'

    db.query(queryStr, req.params.id, (err, queryResult) => {
        if (err) return res.cc(err)

        const fullPath = path.join(imageBasePath, queryResult[0].image_path.split('food-info-image\\')[1])

        res.sendFile(fullPath)
    })
}

export {
    getFoodInfo,
    getSingleInfo,
    getFoodImage
}