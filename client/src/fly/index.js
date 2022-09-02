import Fly from "flyio/dist/npm/wx"
import api from '../api/index'

const instance = new Fly
instance.config.baseURL = 'http://47.116.65.85'

let requestArray = []
let allowArray = ['/sleep-music/welcome', '/diet-record/get', '/food/single', '/food/single', '/sleep-record/get']

instance.interceptors.request.use(config => {
    uni.showLoading({
        title: '加载中...',
        mask: true
    })

    const isRequesting = requestArray.some(item => item === config.url)

    if (allowArray.indexOf(config.url) === -1) {
        if (isRequesting) {
            uni.hideLoading()
            return Promise.resolve({ message: 'interrupt request', status: 1 })
        }
        else {
            requestArray.push(config.url)
        }
    }

    const token = uni.getStorageSync('token')

    if (token) {
        config.headers.Authorization = token
    }

    return config
}, err => {
    uni.hideLoading()
    return Promise.reject(err.message)
})

instance.interceptors.response.use(response => {
    if (response.data.message === 'Certification fail') {
        const url = response.request.url
        const method = response.request.method
        const params = response.request.params
        const body = response.request.body

        const res = api.getToken(async () => {
            return await instance.request(url, body || params, { method }).catch(err => err)
        })

        requestArray = requestArray.filter(item => item !== url)
        uni.hideLoading()
        return res
    }

    requestArray = requestArray.filter(item => item !== response.request.url)
    uni.hideLoading()
    return response.data
}, err => {
    uni.showToast({
        icon: 'none',
        title: '请求失败'
    })

    requestArray = []
    uni.hideLoading()
    Promise.reject(err.message)
})

export default instance