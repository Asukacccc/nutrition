import db from '../database.js'

function searchInDataBase(keyword) {
    return new Promise((resolve, reject) => {
        const foodStr = 'select * from `qa_food` where name like ?'

        db.query(foodStr, keyword + '%', (err, foodResult) => {
            if (err) return reject(err)

            resolve(foodResult)
        })
    })
}

async function getSearchResult(req, res) {
    const result = await searchInDataBase(req.params.search).catch(err => res.cc(err))

    if (result) {
        res.cc(result, 0)
    }
}

async function getClassification(req, res) {
    const keyId = req.query.id
    let keyWord = '', resultArray = []

    switch (Number(keyId)) {
        case 0:
            keyWord = ['米', '面', '酒', '肉']            //常用
            break
        case 1:
            keyWord = ['米', '面', '麦', '薯']            //主食
            break
        case 2:
            keyWord = ['肉', '鱼', '鸡', '鸭']            //肉类
            break;
        case 3:
            keyWord = ['菜', '菌', '根', '茎']            //蔬菜
            break
        case 4:
            keyWord = ['果', '蕉', '莓', '瓜']            //水果
            break
        case 5:
            keyWord = ['酒', '可乐', '奶', '水']              //饮料
            break
    }

    for (let i of keyWord) {
        const result = await searchInDataBase(i).catch(err => res.cc(err))

        if (result) resultArray.push(...result)
        else return
    }

    res.cc(resultArray, 0)
}

export {
    getSearchResult,
    getClassification
}