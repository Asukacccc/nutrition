<template>
    <scroll-view scroll-y class="container" :style="{ height: containerHeight + 'px', top: containerTop + 'px' }">
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <view :class="['detail-container', display ? 'active' : '']"
            :style="{ top: top + 'px', marginBottom: top + 'px' }">
            <view @click="closeHandler">
                <image src="../../static/icon/component/close.png" class="close-icon" mode="widthFix"></image>
            </view>
            <view class="user-info" v-if="!isSelf">
                <view class="info">
                    <view class="info-1">-- 来自&nbsp;</view>
                    <view class="info-2">{{ nickname }}</view>
                </view>
                <view class="avatar">
                    <image :src="avatar" class="avatar-image"></image>
                </view>
            </view>
            <view class="self-work" v-else>我的作品</view>
            <view class="container-name">{{ isMusicItem ? '助眠曲' : '食谱' }}查看</view>
            <view class="title">
                <view class="abstract-title abstract">名称：</view>
                <view class="specific-title">{{ title }}</view>
            </view>
            <view class="singer" v-if="isMusicItem">
                <view class="abstract-singer abstract">歌手名称：</view>
                <view class="specific-singer">{{ singer }}</view>
            </view>
            <view class="content">
                <view class="abstract-content abstract">内容：</view>
                <view class="specific-content">
                    <view class="recipe" v-if="!isMusicItem">
                        <view class="item" v-for="(item, i) in contentList" :key="item.id">
                            <view class="wordage">
                                <view class="number">{{ i + 1 }}.</view>
                                <view class="text">{{ item.text }}</view>
                            </view>
                            <view class="photo" v-if="item.imgSrc">
                                <image :src="item.imgSrc" class="image"></image>
                            </view>
                        </view>
                    </view>
                    <view class="music" v-else>
                        <view class="video-source" v-if="isVideo">
                            <video class="music-video" id="music-video" :src="musicSourcePath"
                                :show-fullscreen-btn="false" play-btn-position="center"
                                @loadedmetadata="changeVideoStyle"
                                :style="{ height: videoStyle.height + 'px', width: videoStyle.width + 'px' }"></video>
                        </view>
                        <view class="image-source" v-else>
                            <view class="playView" @click="changePlayStatus">
                                <image :src="playStatus" class="playStatusImage"></image>
                            </view>
                            <image class="music-picture" :src="musicSourcePath"></image>
                        </view>
                    </view>
                </view>
            </view>
            <view class="fond">
                <view class="abstract-fond abstract">认可</view>
                <view class="specific-fond">
                    <view class="icon">
                        <image class="icon-image" mode="widthFix" src="../../static/icon/me-page/fond.png"></image>
                    </view>
                    <view class="count">{{ count }}</view>
                </view>
            </view>
        </view>
    </scroll-view>
</template>

<script setup>

import { getCurrentInstance, ref, computed, inject, useAttrs, watch } from 'vue'
import { useStore } from 'vuex'
import request from '../fly/index.js'
import ShallowBackground from './shallow-background.vue';

const store = useStore(), attrs = useAttrs()
const top = ref()
const $http = inject('$http')
let availableHeight = computed(() => store.state.system.availableHeight)
const display = ref(false)
const instance = getCurrentInstance()
const title = ref("")
const avatar = ref('')
const isSelf = ref(false)
const contentList = ref([])
const nickname = ref()
const count = ref(0)
const backgroundDisplay = ref()
const emit = defineEmits(['closeDetailContainer'])
let isMusicItem = ref(false), musicSourcePath = ref(''), isVideo = ref(false)
const singer = ref()
const playStatus = ref('../static/image/component/play.png')
const audio = uni.createInnerAudioContext({
    useWebAudioImplement: true
})
const videoStyle = ref({})
let itemContent, audioPlay = false, hasAudioFile = false

let containerHeight = computed(() => store.state.system.availableHeight)
let containerTop = computed(() => store.state.system.statusHeight + store.state.system.navigationHeight)

audio.loop = true

function changeVideoStyle(e) {
    const tempHeight = e.detail.height
    const tempWidth = e.detail.width
    const radio = tempWidth / tempHeight

    videoStyle.value.width = 300
    videoStyle.value.height = 300 / radio
    
    if (videoStyle.value.height > 225) {
        videoStyle.value.height = 225
        videoStyle.value.width = 255 * radio
    }

    setTop()
}

function changePlayStatus() {
    if (!hasAudioFile) {
        audio.src = `${request.config.baseURL}/sleep-music/source/${itemContent.id}/audio`
        hasAudioFile = true
    }

    if (!audioPlay) {
        audio.play()
        audioPlay = true
        playStatus.value = '../static/image/component/stop.png'
    } else {
        audio.pause()
        audioPlay = false
        playStatus.value = '../static/image/component/play.png'
    }
}

function closeHandler() {
    if (isVideo.value) {
        const video = uni.createVideoContext('music-video', instance)
        video.pause()

        backgroundDisplay.value = 'false'
        emit('closeDetailContainer')

        return
    }

    backgroundDisplay.value = 'false'

    audio.pause()
    playStatus.value = '../static/image/component/play.png'
    hasAudioFile = false
    audioPlay = false

    emit('closeDetailContainer')
}

function getUserAvatar(temp) {
    return new Promise(async resolve => {
        if (temp.indexOf('https://thirdwx.qlogo.cn/') !== -1) {
            avatar.value = temp
            resolve()
        } else {
            avatar.value = await $http.getUserAvatar(temp)
            resolve()
        }
    })
}

function getContent(src) {
    return new Promise(async (resolve, reject) => {
        const contentResult = await $http.getRecipeContent(src)

        if (contentResult.status) return reject(contentResult)

        let array = contentResult.message

        for (let i of array) {
            i.imgSrc = !i.imgSrc ? '' : `${request.config.baseURL}/diet-recipe/image/${i.imgSrc}`
        }

        contentList.value = array

        resolve()
    })
}

function getWelcomeCount(id) {
    return new Promise(async (resolve, reject) => {
        if (isMusicItem.value) {
            const countResult = await $http.getSleepMusicWelcomeCount(id)

            if (countResult.status) return reject(countResult)

            count.value = countResult.message.length
            isSelf.value = Number(countResult.message.self)
            
            resolve()
        } else {
            const countResult = await $http.getRecipeWelcomeCount(id)

            if (countResult.status) return reject(countResult)

            count.value = countResult.message.length
            isSelf.value = Number(countResult.message.self)

            resolve()
        }
    })
}

function setTop() {
    setTimeout(() => {
        const query = uni.createSelectorQuery().in(instance)

        query.select('.detail-container').boundingClientRect()
        query.exec(elementRes => {
            const height = elementRes[0].height

            if (height + 16 * 2 > availableHeight.value) {
                top.value = 16
            } else {
                top.value = (availableHeight.value - height) / 2
            }

            backgroundDisplay.value = 'true'
        })
    }, 100)
}

function getMusicSource(id, flag) {
    if (flag) {
        musicSourcePath.value = `${request.config.baseURL}/sleep-music/source/${id}/image`
    } else {
        musicSourcePath.value = `${request.config.baseURL}/sleep-music/source/${id}/total`
    }

    isVideo.value = !flag
}

async function requestSource(info) {
    if (isMusicItem.value) {
        let { title: itemTitle, nickname: itemNickname, avatar: itemAvatar, id: itemId, is_picture: isPicture, singer: itemSinger } = info

        title.value = itemTitle
        nickname.value = itemNickname
        singer.value = itemSinger

        await Promise.all([getUserAvatar(itemAvatar), getMusicSource(itemId, Number(isPicture)), getWelcomeCount(itemId)])

    } else {
        let { title: itemTitle, nickname: itemNickname, avatar: itemAvatar, id: itemId, source: itemSource } = info

        title.value = itemTitle
        nickname.value = itemNickname

        await Promise.all([getUserAvatar(itemAvatar), getContent(itemSource), getWelcomeCount(itemId)]).catch(err => { if (err) console.log(err) })
    }

    itemContent = info

    setTop()
}

watch(() => attrs.detailDisplay, (val) => {
    if (val) {
        isMusicItem.value = Reflect.has(attrs.scanItem, 'is_picture') ? true : false
        display.value = true
        requestSource(attrs.scanItem)
    }
    else display.value = false
})
</script>

<style lang="less" scoped>
.container {
    overflow: hidden;
    left: 50%;
    transform: translateX(-50%) scale(1);
    width: 100vw;
    position: absolute;
    z-index: 3;
    pointer-events: none;

    .detail-container {
        width: 340px;
        box-sizing: border-box;
        padding: 16px 22px 40px;
        background-color: white;
        margin: 0 auto;
        position: absolute;
        opacity: 0;
        pointer-events: none;
        left: 50%;
        transition: 0.2s;

        &.active {
            opacity: 1;
            transform: translate(-50%);
            pointer-events: auto;
        }

        .close-icon {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 20px;
            z-index: 2;
        }

        .user-info {
            position: absolute;
            right: 16px;
            bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .avatar {
                width: 30px;
                height: 30px;
                margin-left: 4px;
                overflow: hidden;
                border-radius: 50%;

                .avatar-image {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
            }

            .info {
                font-size: 12px;
                display: flex;
                align-items: center;

                .info-1 {
                    color: #C0C0C0;
                }

                .info-2 {
                    color: #0D7377;
                }
            }
        }

        .self-work {
            position: absolute;
            top: 0;
            left: 0;
            width: 90px;
            font-size: 12px;
            height: 20px;
            background-color: #0D7377;
            color: white;
            text-align: center;
            line-height: 20px;
            border-bottom-right-radius: 6px;
        }

        .container-name {
            color: #0D7377;
            font-size: 16px;
            margin: 0 auto;
            position: relative;
            text-align: center;

            &::after {
                content: '';
                position: absolute;
                opacity: 0.25;
                height: 2px;
                background-color: #707070;
                width: 428px;
                bottom: -8px;
                left: 50%;
                transform: translate(-50%) scale(0.5);
            }
        }

        .abstract {
            color: #929292;
            font-size: 12px;
            margin-bottom: 4px;

            &:not(.abstract-title) {
                margin-top: 44px;
            }
        }

        .title,
        .content,
        .singer {
            position: relative;

            &::after {
                position: absolute;
                height: 2px;
                bottom: -16px;
                width: 524px;
                left: 50%;
                transform: translateX(-50%) scale(0.5);
                background-color: #707070;
                content: '';
                opacity: 0.25;
            }
        }

        .title {
            margin-top: 26px;

            .specific-title {
                color: black;
                font-size: 16px;
            }
        }

        .content {
            .specific-content {
                .recipe {
                    .item {
                        margin-bottom: 30px;
                        position: relative;

                        .wordage {
                            display: flex;
                            font-size: 14px;
                            margin-bottom: 10px;

                            .number {
                                width: 16px;
                            }

                            .text {
                                flex: 1;
                            }
                        }

                        .photo {
                            margin: 0 auto;
                            width: 180px;
                            height: 180px;
                            border-radius: 6px;
                            overflow: hidden;

                            .image {
                                width: 100%;
                                height: 100%;
                                display: block;
                            }
                        }

                        &:not(:last-child):after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            height: 2px;
                            width: 270px;
                            background-color: #707070;
                            opacity: 0.2;
                            left: 50%;
                            transform: translateX(-50%) scale(0.5);
                        }
                    }
                }

                .music {
                    margin-bottom: 30px;
                    position: relative;

                    .video-source {
                        .music-video {
                            margin: 0 auto;
                            display: block;
                        }
                    }

                    .image-source {

                        .playView {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);

                            .playStatusImage {
                                width: 32px;
                                height: 32px;
                                display: block;
                            }
                        }

                        .music-picture {
                            width: 300px;
                            height: 120px;
                            display: block;
                        }
                    }
                }
            }
        }

        .fond {
            .specific-fond {
                display: flex;
                align-items: center;

                .icon {
                    .icon-image {
                        display: block;
                        width: 15px;
                    }
                }

                .count {
                    margin-left: 6px;
                    font-size: 14px;
                }
            }

        }
    }
}
</style>

