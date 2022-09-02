<template>
    <view class="container">
        <nav-bar isBack="true" title="助眠曲"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <user-detail :userDetail="userDetail" :musicFlag="1" :workId="workId" @closeDetailContainer="closeDetailContainer" :user="user"></user-detail>
        <view>
            <scroll-view scroll-y class="music-container" refresher-enabled :style="{ height: scrollHeight + 'px' }"
                :refresher-triggered="refreshTrigger" @scrolltolower="scrollToLowerHandler"
                @refresherrefresh="refreshHandler">
                <view class="copy">点击歌曲以复制</view>
                <view class="list">
                    <view class="item" v-for="item in musicList" :key="item.id">
                        <view class="content">
                            <view class="cover" @click="play" :data-flag="item.id"
                                :style="{ height: (videoContainerHeightObj[item.id] || 132) + 'px' }">
                                <view v-if="item.is_picture - 0">
                                    <image class="cover-image" :src="sourceRequestHandler(item.id, 'image')"
                                        mode="widthFix"></image>
                                    <image class="play-pause"
                                        :src="!playStatusObj[item.id] ? '../../../static/image/component/play.png' : '../../../static/image/component/stop.png'">
                                    </image>
                                </view>
                                <view v-else class="video-part">
                                    <image class="cover-image" :src="sourceRequestHandler(item.id, 'cover')"
                                        v-if="!playStatusObj[item.id] && !playStatusObj['videoHeight-' + item.id]"
                                        mode="aspectFill"></image>
                                    <video v-else class="music-video"
                                        :style="{ height: playStatusObj['videoHeight-' + item.id] + 'px' }"
                                        :show-fullscreen-btn="false" autoplay :controls="playStatusObj[item.id]"
                                        @loadedmetadata="videoLoadedmetadata($event, item.id)"
                                        @pause="videoPauseHandler(item.id)" @play.stop="videoPlayHandler(item.id)"
                                        :src="sourceRequestHandler(item.id, 'total')"></video>
                                    <image class="play-pause"
                                        :src="!playStatusObj['videoHeight-' + item.id] ? '../../../static/image/component/play.png' : ''">
                                    </image>
                                </view>
                            </view>
                            <view class="info">
                                <view class="title-singer" @click="copyContent" :data-flag="item.id">
                                    <view class="title">{{ item.title }}</view>
                                    <view class="singer">{{ item.singer }}</view>
                                </view>
                                <view class="user-fond">
                                    <view class="user" @click="getUserInfo" :data-flag="item.id">
                                        <image class="avatar-image" :src="avatarHandler(item.avatar)"></image>
                                        <view class="nickname">{{ item.nickname }}</view>
                                    </view>
                                    <view class="middle-fond">
                                        <view class="middle"></view>
                                        <view class="fond" @click="confirmHandler" :data-flag="item.id">
                                            <image class="fond-image"
                                                :src="(fondCountList[item.id] ? fondCountList[item.id].confirm : false) ? '../../../static/icon/me-page/fond.png' : '../../../static/icon/me-page/not-fond.png'">
                                            </image>
                                            <view class="fond-count">{{ fondCountList[item.id] ?
                                                    fondCountList[item.id].length : 0
                                            }}</view>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
        <view class="release" @click="releaseHandler">
            <image class="release-image" src="../../../static/image/component/release.png"></image>
        </view>
    </view>
</template>

<script setup>

import { inject, ref, reactive, computed } from 'vue'
import HintMessage from '../../../components/hint-message.vue'
import showToast from '../../../utils/showToast'
import request from '../../../fly/index'
import { useStore } from 'vuex'
import itemDetailVue from '../../../components/item-detail.vue'
import instance from '../../../fly/index'
import UserDetail from '../../../components/user-detail.vue'
import ShallowBackground from '../../../components/shallow-background.vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'

function copyContent(e) {
    const id = e.currentTarget.dataset.flag
    const item = musicList.value.find(v => v.id === id)

    uni.setClipboardData({
        data: item.title + ' - ' + item.singer,
        success() {
            showToast('复制成功')
        }
    })
}

function releaseHandler() {
    const avatar = store.state.user.avatar

    audio.pause()
    playStatusObj[lastPlayAudio] = 0
    sameAudioPlayStatus = !sameAudioPlayStatus

    if (!avatar) {
        showToast('尚未登录, 无法发布')
    } else {
        uni.navigateTo({
            url: '/sub-package/sleep-music/release/release'
        })
    }
}

async function getUserInfo(e) {
    const id = e.currentTarget.dataset.flag
    const result = await $http.getUserInfoByMusicId(id)

    if (result.status) return showToast()

    userDetail.value = true
    user.value = result.message
    backgroundDisplay.value = 'true'
    workId.value = id
}

function closeDetailContainer() {
    userDetail.value = false
    backgroundDisplay.value = ''
}

async function confirmHandler(e) {
    const id = e.currentTarget.dataset.flag

    if (!store.state.user.avatar) {
        return showToast('尚未登录, 无法认可')
    }

    const updateResult = await $http.confirmSleepMusic(id)

    if (updateResult.status) return showToast('认可错误')

    fondCountList[id] = await $http.getFondCount(id)
}

function videoPauseHandler(id) {
    playStatusObj[id] = false
    videoContainerHeightObj[id] = 132
    playStatusObj[`play-${id}`] = false
    hasPlay = false
    clickPauseButton = true
}

function videoPlayHandler(id) {
    playStatusObj[`play-${id}`] = true
    hasPlay = true
}

function play(e) {
    const id = e.currentTarget.dataset.flag
    let { is_picture: flag } = musicList.value.find(v => v.id === id)

    flag = flag - 0

    if (flag) {
        if (id === lastPlayAudio && !hasPlay) {
            sameAudioPlayStatus ? audio.pause() : audio.play()

            playStatusObj[id] = 1 - playStatusObj[id]
            sameAudioPlayStatus = !sameAudioPlayStatus
        } else {
            if (hasPlay) {
                const item = musicList.value.find(v => v.id === lastVideoPlay)

                hintMessage.value = `${item.title} - ${item.singer} 正在播放`
                hintDisplay.value = String(Math.random())
                return
            }

            audio.src = `${request.config.baseURL}/sleep-music/source/${id}/${'audio'}`
            playStatusObj[lastPlayAudio] = 0
            playStatusObj[id] = 1
            lastPlayAudio = id
            sameAudioPlayStatus = true
            audio.play()
        }
    } else {
        audio.pause()
        playStatusObj[lastPlayAudio] = 0

        if (!playStatusObj[id]) {
            setTimeout(() => {
                if (clickPauseButton) return clickPauseButton = false

                if (hasPlay) {
                    const item = musicList.value.find(v => v.id === id)

                    hintDisplay.value = String(Math.random())
                    hintMessage.value = `${item.title} - ${item.singer} 正在播放`
                    return
                }
                playStatusObj[id] = true
                lastVideoPlay = id
                videoContainerHeightObj[id] = playStatusObj['videoHeight-' + id]
            }, 100)
        } else {
            setTimeout(() => {
                if (!playStatusObj[`play-${id}`]) {
                    videoPauseHandler(id)
                }
            }, 100)
        }
    }
}

function videoLoadedmetadata(e, id) {
    const radio = e.detail.height / e.detail.width

    videoContainerHeightObj[id] = 330 * radio
    playStatusObj['videoHeight-' + id] = 330 * radio
    playStatusObj[id] = true
}

async function requestSleepMusic(info, isPush = true) {
    const getResult = await $http.getSleepMusic(info)

    setTimeout(() => refreshTrigger.value = false, 100)

    if (getResult.status) return showToast()

    if (!getResult.message.length && !isPush) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '已是最新数据'
    }

    if (!getResult.message.length && isPush) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '没有数据了'
    }

    musicList.value = isPush ? [...musicList.value, ...getResult.message] : [...getResult.message, ...musicList.value]

    start += isPush ? 0 : getResult.message.length

    for (let i of getResult.message) {
        fondCountList[i.id] = await $http.getFondCount(i.id)
    }
}

function sourceRequestHandler(id, type) {
    return `${request.config.baseURL}/sleep-music/source/${id}/${type}`
}

function avatarHandler(path) {
    if (path[0] === 'h') {
        return path
    } else {
        return `${request.config.baseURL}/user/get-avatar/${path}`
    }
}

function scrollToLowerHandler() {
    requestSleepMusic({
        self: 0,
        start,
        length,
        boundary: '0'
    })

    start += length
}

function refreshHandler() {
    refreshTrigger.value = true

    requestSleepMusic({
        self: 0,
        start: 0,
        length: 10,
        boundary: musicList.value[0].time
    }, false)
}

const $http = inject('$http')
let start = 0, length = 10
const musicList = ref([])
const fondCountList = reactive({})
const store = useStore()
const refreshTrigger = ref(false)
const hintDisplay = ref('')
const hintMessage = ref('')
const audio = uni.createInnerAudioContext({
    useWebAudioImplement: true
})
const playStatusObj = reactive({})
let lastPlayAudio = 0, sameAudioPlayStatus = false
const videoContainerHeightObj = reactive({})
let hasPlay, lastVideoPlay
const userDetail = ref(false), user = ref()
const backgroundDisplay = ref()
let clickPauseButton = false
const workId = ref()

let scrollHeight = computed(() => store.state.system.availableHeight)

audio.loop = true

requestSleepMusic({
    self: 0,
    start,
    length,
    boundary: '0'
})

start += length
length = 4

onUnload(() => {
    audio.pause()
})

onShow(() => {
    if (musicList.value.length)
        requestSleepMusic({
            self: 0,
            start: 0,
            length: 10,
            boundary: musicList.value[0].time
        }, false)
})

</script>

<style lang="less" scoped>
.container {
    /deep/ .shallow-container {
        z-index: 1;
    }

    .release {
        position: absolute;
        right: 10px;
        bottom: 20px;

        .release-image {
            width: 60px;
            height: 60px;
            display: block;
        }
    }

    .music-container {
        height: 0px;
        position: relative;
        z-index: 0;

        .copy {
            color: #8B8B8B;
            font-size: 10px;
            text-align: center;
            height: 34px;
            line-height: 34px;
        }

        .list {
            padding-bottom: 40px;

            .item {
                width: 350px;
                margin: 0 auto 14px;
                box-sizing: border-box;
                padding: 10px;
                border-radius: 8px;
                background-color: white;

                .content {
                    display: flex;
                    flex-direction: column;

                    .cover {
                        position: relative;
                        margin-bottom: 10px;
                        overflow: hidden;
                        height: 132px;
                        position: relative;
                        transition: 0.3s;

                        .video-part {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 100%;


                        }

                        .cover-image {
                            width: 100%;
                            display: block;
                        }

                        .play-pause {
                            width: 32px;
                            height: 32px;
                            display: block;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        }

                        .music-video {
                            width: 100%;
                            display: block;

                        }
                    }

                    .info {
                        display: flex;
                        justify-content: space-between;

                        .title-singer {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            flex: 1;
                            margin-right: 10px;
                            width: 0;

                            .title,
                            .singer {
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }

                            .title {
                                font-size: 14px;
                                font-weight: bold;
                            }

                            .singer {
                                font-size: 12px;
                            }
                        }

                        .user-fond {
                            display: flex;
                            width: 170px;
                            align-items: center;
                            justify-content: flex-end;
                            overflow: hidden;

                            .user {
                                display: flex;
                                align-items: center;
                                justify-content: flex-end;
                                flex: 1;
                                width: 0;

                                .nickname {
                                    font-size: 12px;
                                    color: #ADADAD;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }

                                .avatar-image {
                                    flex-shrink: 0;
                                    width: 30px;
                                    height: 30px;
                                    display: block;
                                    overflow: hidden;
                                    border-radius: 50%;
                                    margin-right: 6px;
                                }
                            }

                            .middle-fond {
                                display: flex;

                                .middle {
                                    width: 2px;
                                    height: 26px;
                                    background-color: black;
                                    opacity: .2;
                                    margin: 0 6px;
                                }

                                .fond {
                                    display: flex;
                                    align-items: center;

                                    .fond-image {
                                        flex-shrink: 0;
                                        width: 14px;
                                        height: 14px;
                                        display: block;
                                        margin-right: 6px;
                                    }

                                    .fond-count {
                                        white-space: nowrap;
                                        font-size: 14px;
                                        max-width: 80px;
                                        text-align: right;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>