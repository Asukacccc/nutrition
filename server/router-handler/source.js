import path from 'path'
import fs from 'fs'

const basePath = path.join(path.resolve(), '../DataBaseSource/picture')

function getImageSource(req, res) {
    fs.readdir(basePath, (err, data) => {
        for (let i of data) {
            if (i.indexOf(req.params.path) !== -1) {
                return res.sendFile(path.join(basePath, i))
            }
        }
    })
}

export {
    getImageSource
}