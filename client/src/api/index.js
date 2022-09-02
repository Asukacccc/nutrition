import request from '../fly/index.js'
import store from '../store/index.js'

function getToken(callback) {
    return new Promise(resolve => {
        uni.login({
            async success(res) {
                const result = await request.post('/user/open', { code: res.code })

                if (result.status === 1) return uni.showToast({
                    title: '用户验证失败',
                    duration: 1500
                })
                uni.setStorageSync('token', result.token)
                const cbResult = callback && callback()
                resolve(cbResult)
            },
            fail() {
                uni.showToast({
                    icon: 'none',
                    title: '登录失败'
                })
            }
        })
    })
}

async function getUserInfo() {
    const res = await request.get('/user/get')

    if (res.status) return

    store.commit('user/setAvatar', res.message.avatar)
    store.commit('user/setNickname', res.message.nickname)
    store.commit('user/setSignature', res.message.sign)
}

function setUserInfo(info) {
    return new Promise(async resolve => {
        const res = await request.post('/user/set', info)
        getUserInfo()
        resolve(res)
    })
}

function uploadFile(tempFilePath, extraUrl, fileName, formData = {}, showLoading = true) {
    return new Promise((resolve, reject) => {
        if (showLoading) {
            uni.showLoading({
                title: '上传中',
                mask: true
            })
        }
        const upload = uni.uploadFile({
            url: request.config.baseURL + extraUrl,
            filePath: tempFilePath,
            header: {
                Authorization: uni.getStorageSync('token')
            },
            name: fileName,
            formData,
            success(uploadResult) {
                if (showLoading) uni.hideLoading()
                if (extraUrl === '/user/avatar') getUserInfo()
                resolve(uploadResult)
            }
        })

        upload.onProgressUpdate(res => {
            store.commit('progress/setTotalBytesSent', res.totalBytesSent)
        })
    })
}

function uploadAvatar(info) {
    return uploadFile(info.tempFilePath, '/user/avatar', 'avatar')
}

function uploadFeedbackImage({ tempFilePath, formData }) {
    return uploadFile(tempFilePath, '/user/set-feedback-image', 'feedback', formData)
}

function getUserReleaseCount(info = {}) {
    return new Promise(async resolve => {
        const res = await request.get('/user/count', info)
        resolve(res)
    })
}

function getUserFondList() {
    return new Promise(async resolve => {
        const result = await request.get('/user/fond')
        resolve(result)
    })
}

function getSleepMusic(info) {
    return new Promise(async resolve => {
        const getResult = await request.get('/sleep-music/total', info)

        resolve(getResult)
    })
}

function getDietRecipe(info) {
    return new Promise(async resolve => {
        const getResult = await request.get('/diet-recipe/total', info)

        resolve(getResult)
    })
}

function getRecipeWelcomeCount(id) {
    return new Promise(async resolve => {
        const countResult = await request.get('/diet-recipe/welcome', { id })

        resolve(countResult)
    })
}

function getRecipeContent(src) {
    return new Promise(async resolve => {
        const getResult = await request.get('/diet-recipe/detail', { source: src })

        resolve(getResult)
    })
}

function getUserAvatar(temp) {
    return new Promise(resolve => {
        temp = `${request.config.baseURL}/user/get-avatar/${temp}`
        uni.downloadFile({
            url: temp,
            header: {
                Authorization: uni.getStorageSync('token')
            },
            success(res) {
                resolve(res.tempFilePath)
            }
        })
    })
}

function getFondCount(id, isMusic = true) {
    return new Promise(async resolve => {
        if (isMusic) {
            const getResult = await request.get('/sleep-music/welcome', { id })

            resolve(getResult.message)
        } else {
            const getResult = await request.get('/diet-recipe/welcome', { id })

            resolve(getResult.message)
        }
    })
}

function deleteSleepMusicItem(id) {
    return new Promise(async resolve => {
        const deleteResult = await request.get('/sleep-music/delete', { id })

        resolve(deleteResult)
    })
}

function getSleepMusicWelcomeCount(id) {
    return new Promise(async resolve => {
        const countResult = await request.get('/sleep-music/welcome', { id })

        resolve(countResult)
    })
}

function deleteRecipeItem(id) {
    return new Promise(async resolve => {
        const deleteResult = await request.get('/diet-recipe/delete', { id })

        resolve(deleteResult)
    })
}

function getSleepMusicByIdArr(arr) {
    return new Promise(async resolve => {
        const getResult = await request.get('/sleep-music/total-id', { arr })

        resolve(getResult)
    })
}

function getDietRecipeByIdArr(arr) {
    return new Promise(async resolve => {
        const res = await request.get('/diet-recipe/total-id', { arr })

        resolve(res)
    })
}

function cancelMusicConfirm(id) {
    return new Promise(async resolve => {
        const res = await request.get('/sleep-music/cancel-confirm', { id })

        resolve(res)
    })
}

function cancelRecipeConfirm(id) {
    return new Promise(async resolve => {
        const res = await request.get('/diet-recipe/cancel-confirm', { id })

        resolve(res)
    })
}

function setFeedback(info) {
    return new Promise(async resolve => {
        const setResult = await request.post('/user/set-feedback', info)

        resolve(setResult)
    })
}

function getFeedBack(info) {
    return new Promise(async resolve => {
        const getResult = await request.get('/user/get-feedback', info)

        resolve(getResult)
    })
}

function confirmSleepMusic(id) {
    return new Promise(async resolve => {
        const updateResult = await request.get('/sleep-music/update-welcome', { id })

        resolve(updateResult)
    })
}

function getUserInfoByMusicId(id) {
    return new Promise(async resolve => {
        const getResult = await request.get('/sleep-music/user-info', { id })

        resolve(getResult)
    })
}

function uploadSleepMusicSource(info, flag = true) {
    if (info.path === '') {
        return new Promise(async resolve => {
            const result = request.post('/sleep-music/upload', info.formData)

            resolve(result)
        })
    }

    return uploadFile(info.path, '/sleep-music/upload', 'source', info.formData, flag)  
}

function saveAudioPictureInfo(info) {
    return new Promise(async resolve => {
        const saveResult = await request.post('/sleep-music/save', info)

        resolve(saveResult)
    })
}

function uploadExistConfirm(info) {
    return new Promise(async resolve => {
        const confirmResult = request.get('/sleep-music/upload', info)

        resolve(confirmResult)
    })
}

function confirmRecipe(id) {
    return new Promise(async resolve => {
        const updateResult = await request.get('/diet-recipe/update-welcome', { id })

        resolve(updateResult)
    })
}

function getUserInfoByRecipeId(id) {
    return new Promise(async resolve => {
        const infoResult = await request.get('/diet-recipe/user-info', { id })

        resolve(infoResult)
    })
}

function setRecipe(info) {
    return new Promise(async resolve => {
        const setResult = await request.post('/diet-recipe/set', info)

        resolve(setResult)
    })
}

function uploadRecipeImage(info) {
    return uploadFile(info.path, '/diet-recipe/upload', 'image', { name: info.name })
}

function getDietRecord(info) {
    return new Promise(async resolve => {
        const getResult = await request.get('/diet-record/get', info)

        resolve(getResult)
    })
} 

function getSingleFoodInfo(info) {
    return new Promise(async resolve => {
        const infoResult = await request.get('/food/single', info)

        resolve(infoResult)
    })
}

function getRecordJournal(info) {
    return new Promise(async resolve => {
        const infoResult = await request.get('/diet-journal/get', info)

        resolve(infoResult)
    })
}

function getFoodInfo(info) {
    return new Promise(async resolve => {
        const result = await request.get('/food/detail', info)

        resolve(result)
    })
}

function searchFood(info) {
    return new Promise(async resolve => {
        const result = await request.get(`/search/${ info }`)

        resolve(result)
    })
}

function setDietRecord(info) {
    return new Promise(async resolve => {
        const result = await request.post('/diet-record/set', info)

        resolve(result)
    })
}

function setJournal(info) {
    return new Promise(async resolve => {
        const result = await request.post('/diet-journal/set', info)

        resolve(result)
    })
}

function requestIngredient(name) {
    return new Promise(async resolve => {
        uni.request({
            url: 'http://api.tianapi.com/nutrient/index',
            data: {
                key: '085dab66f573fb25e25333ec6f24d336',
                word: name,
                mode: 0
            },
            success(res) {
                resolve(res.data)
            }
        })
    })
}

function getSleepRecord(info) {
    return new Promise(async resolve => {
        const result = await request.get('/sleep-record/get', info)

        resolve(result)
    }) 
}

function setSleepRecord(info) {
    return new Promise(async resolve => {
        const result = await request.post('/sleep-record/set', info)

        resolve(result)
    })
}

function getArticleInfo() {
    return new Promise(async resolve => {
        const result = await request.get('/article/get')

        resolve(result)
    })
}

function getSearchResultByQa(search) {
    return new Promise(async resolve => {
        const result = await request.get('/food-detail/search/' + search)

        resolve(result)
    })
}

function getAnswerInfo() {
    return new Promise(async resolve => {
        const result = await request.get('/answer/get')

        resolve(result)
    })
}

function getEvaluation() {
    return new Promise(async resolve => {
        const result = await request.get('/evaluation/get')

        resolve(result)
    })
}

function getClassificationResultByQa(info) {
    return new Promise(async resolve => {
        const requestResult = await request.get('/food-detail/get', info)

        resolve(requestResult)
    })
}

function getArticleContent(info) {
    return new Promise(async resolve => {
        const requestResult = await request.get('/article/content', info)

        resolve(requestResult)
    })
}

export default {
    getToken,
    setUserInfo,
    getUserInfo,
    uploadAvatar,
    getUserReleaseCount,
    getUserFondList,
    getSleepMusic,
    getDietRecipe,
    getUserAvatar,
    getRecipeContent,
    getRecipeWelcomeCount,
    getSleepMusicWelcomeCount,
    deleteSleepMusicItem,
    deleteRecipeItem,
    getSleepMusicByIdArr,
    getDietRecipeByIdArr,
    cancelMusicConfirm,
    cancelRecipeConfirm,
    uploadFeedbackImage,
    setFeedback,
    getFeedBack,
    getFondCount,
    confirmSleepMusic,
    getUserInfoByMusicId,
    uploadSleepMusicSource,
    saveAudioPictureInfo,
    uploadExistConfirm,
    confirmRecipe,
    getUserInfoByRecipeId,
    setRecipe,
    uploadRecipeImage,
    getDietRecord,
    getSingleFoodInfo,
    getRecordJournal,
    getFoodInfo,
    searchFood,
    setDietRecord,
    setJournal,
    requestIngredient,
    getSleepRecord,
    setSleepRecord,
    getArticleInfo,
    getSearchResultByQa,
    getAnswerInfo,
    getEvaluation,
    getClassificationResultByQa,
    getArticleContent
}