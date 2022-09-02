import fs from 'fs'

function createDir(src) {
    fs.mkdirSync(src)
    return true
}

function deleteDir(path) {

    const list = fs.readdirSync(path)

    for (let item of list) {
        const unknownUrl = path + '/' + item

        fs.stat(unknownUrl, (err, stat) => {
            if (err) return console.log(err)

            if (stat.isFile()) {
                fs.unlinkSync(unknownUrl)

                const result = fs.readdirSync(path)

                if (result.length === 0) fs.rmdirSync(path)
            } else {
                deleteDir(unknownUrl)
            }
        })


    }
}

export {
    createDir,
    deleteDir
}