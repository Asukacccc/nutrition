<template>
    <view class="container">
        <nav-bar isBack="true" title="助眠曲"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <view class="cropView">
            <image-crop :src="imageSrc" cropRadio="0.4" :imageWidth="imageWidth" :display="cropDisplay"
                :imageRadio="imageRadio" @closeCropBox="closeCropBox" cropTitle="封面图片裁剪" @getCropResult="getCropResult">
            </image-crop>
        </view>
        <scroll-view enable-flex class="release-container" scroll-y :style="{ height: scrollHeight + 'px' }">
            <view class="caption">发布</view>
            <view class="content">
                <view class="input">
                    <view class="title">
                        <input type="text" class="title-input" focus :adjust-position="false"
                            placeholder-class="placeholder-class" placeholder="在此输入曲名" maxlength="60"
                            @input="inputTitle($event, 60)">
                    </view>
                    <view class="singer">
                        <input type="text" class="singer-input" :adjust-position="false"
                            placeholder-class="placeholder-class" placeholder="再次输入歌手" maxlength="50"
                            @input="inputSinger($event, 50)">
                    </view>
                </view>
                <view class="source">
                    <view class="video-picture">
                        <view class="abstract">- 视频 / 封面 -</view>
                        <view class="choose" :style="{ height: `${videoHeight || 127.2}px` }">
                            <view v-if="!sourcePath" class="choose-button" @click="chooseMedia">选取视频或音频封面</view>
                            <view v-else class="image-video">
                                <image :src="sourcePath" class="choose-image" mode="aspectFill" v-if="isPicture">
                                </image>
                                <video :show-fullscreen-btn="false" :src="sourcePath" class="choose-video" v-else
                                    :style="{ height: `${videoHeight}px` }"></video>
                            </view>
                        </view>
                    </view>
                    <view :class="['audio', isPicture && sourcePath ? '' : 'weaken']">
                        <view class="abstract"
                            :style="{ textDecoration: sourcePath && isPicture ? 'none' : 'line-through' }">- 音源 -</view>
                        <view @click="chooseAudioFile" :class="['audio-play', audioPlaying ? 'playing' : '']">{{
                                hasChooseAudio ? hasChooseAudio.name : '从微信聊天中选取音频文件'
                        }}
                        </view>
                    </view>
                </view>
            </view>
            <view class="info">
                <view class="tips">
                    <view :style="{ opacity: '0.6' }">tips:</view>
                    <view :style="{ marginBottom: '4px' }">素材形式只能是下列其一</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">1. 视频</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">2. 图片外加音频</view>
                </view>
                <view class="button" v-if="!isUploading">
                    <view class="reset submit" @click="resetHandler">素材重选</view>
                    <view class="submit" @click="submitHandler">发布</view>
                </view>
                <view v-else class="upload"
                    :style="{ backgroundImage: `linear-gradient(to right, #0D7377 ${uploadProgress * 100}% ,#00b8a9 ${uploadProgress * 100}%)` }">
                    {{ '上传中..' }}</view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { computed, ref, inject } from 'vue'
import { useStore } from 'vuex'
import HintMessage from '../../../components/hint-message.vue'
import imageCrop from '../../../components/image-crop.vue'
import showToast from '../../../utils/showToast'

async function sendAudioPictureForm() {
    const currentTime = Date.now()
    const audioName = currentTime + hasChooseAudio.value.path.slice(hasChooseAudio.value.path.lastIndexOf('.'))
    const imageName = currentTime + sourcePath.value.slice(sourcePath.value.lastIndexOf('.'))

    const uploadAudioResult = await $http.uploadSleepMusicSource({
        path: hasChooseAudio.value.path,
        formData: {
            name: audioName
        }
    })

    if (uploadAudioResult.state) return showToast('上传失败')

    const uploadPictureResult = await $http.uploadSleepMusicSource({
        path: sourcePath.value,
        formData: {
            name: imageName
        }
    })

    if (uploadPictureResult.state) return showToast('上传失败')

    const saveInfoResult = await $http.saveAudioPictureInfo({
        isPicture: 1,
        title: titleInputRecord,
        singer: singerInputRecord,
        avatar: store.state.user.avatar,
        time: currentTime,
        nickname: store.state.user.nickname,
        audioName,
        imageName
    })


    if (saveInfoResult.statue) return showToast('上传失败')

    showToast('上传成功')
    uni.navigateBack()
}

function sliceVideo(path, start, length, time, i) {
    return new Promise(resolve => {
        fs.access({
            path: `${wx.env.USER_DATA_PATH}/upload-temp/`,
            fail() {
                fs.mkdirSync(`${wx.env.USER_DATA_PATH}/upload-temp/`)
            }
        })

        fs.readFile({
            filePath: path,
            encoding: 'binary',
            position: start,
            length,
            success({ data }) {
                fs.writeFileSync(`${wx.env.USER_DATA_PATH}/upload-temp/${time}-${i}`, data, 'binary')
                resolve()
            },
            fail(e) {
                console.log('error')
            }
        })
    })
}

async function sendVideoForm() {
    const totalChunks = Math.ceil(videoSize / chunksLength)
    const hash = await new Promise(resolve => {
        fs.getFileInfo({
            filePath: sourcePath.value,
            success(infoResult) {
                resolve(infoResult.digest)
            }
        })
    })

    const confirmResult = await $http.uploadExistConfirm({ hash: hash })

    isUploading.value = true

    if (confirmResult.status) return showToast()

    if (confirmResult.message === -1) {
        const doneUploadResult = await $http.uploadSleepMusicSource({
            path: '',
            formData: {
                done: 1,
                name: hash + sourcePath.value.slice(sourcePath.value.lastIndexOf('.'))
            }
        })

        if (doneUploadResult.status) return showToast('上传完成')
    }

    uni.showLoading({ title: "上传中" })

    for (let i = confirmResult.message; i < totalChunks; i++) {
        await sliceVideo(sourcePath.value, i * chunksLength, Math.min(chunksLength, videoSize - i * chunksLength), time, i)

        const uploadResult = await $http.uploadSleepMusicSource({
            path: `${wx.env.USER_DATA_PATH}/upload-temp/${time}-${i}`,
            formData: {
                hash: hash,
                name: hash + sourcePath.value.slice(sourcePath.value.lastIndexOf('.')),
                total: totalChunks,
                index: i,
                title: titleInputRecord,
                singer: singerInputRecord,
                isPicture: 0,
                nickname: store.state.user.nickname,
                avatar: store.state.user.avatar,
                time: time,
                thumb: time + thumbTempPath.slice(thumbTempPath.lastIndexOf('.'))
            }
        }, false)

        if (!netWorkFlag) return

        if (uploadResult.data.status) return showToast('上传失败')

        const exist = fs.accessSync(`${wx.env.USER_DATA_PATH}/upload-temp/${time}-${i}`)

        if (exist) fs.unlinkSync(`${wx.env.USER_DATA_PATH}/upload-temp/${time}-${i}`)

        currentChunks = i
    }

    await $http.uploadSleepMusicSource({
        path: thumbTempPath,
        formData: {
            name: time + thumbTempPath.slice(thumbTempPath.lastIndexOf('.'))
        }
    })

    uni.hideLoading()
    showToast('上传成功')
    uni.navigateBack()
}

function submitHandler() {
    if (!titleInputRecord.trim()) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '曲名为空'
        return
    }

    if (!singerInputRecord.trim()) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '歌手名称为空'
        return
    }

    if (!sourcePath.value) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '尚未选择视频或音频封面'
        return
    }

    if (isPicture.value && !hasChooseAudio.value) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = '尚未选择音频'
        return
    }

    time = Date.now()

    if (isPicture.value) {
        sendAudioPictureForm()
    } else {
        sendVideoForm()
    }
}

function resetHandler() {
    sourcePath.value = false
    hasChooseAudio.value = false
    isPicture.value = false
    audio.src = ''
    audio.pause()
    audioPlaying.value = false
    videoHeight.value = false
    time = 0
    isUploading.value = false
}

function chooseAudioFile() {
    if (hasChooseAudio.value) {
        audioPlaying.value ? audio.pause() : audio.play()
        audioPlaying.value = !audioPlaying.value

        return
    }

    if (!sourcePath.value) return

    uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['m4a', 'wav', 'mp3', 'aac', 'aiff', 'caf'],
        success(chooseResult) {
            hasChooseAudio.value = chooseResult.tempFiles[0]
            audio.src = hasChooseAudio.value.path
        },
        fail() {
            showToast('获取失败')
        }
    })
}

function getCropResult(res) {
    sourcePath.value = res.tempFilePath
    closeCropBox()
}

function closeCropBox() {
    cropDisplay.value = ''
}

function chooseMedia() {
    uni.chooseMedia({
        count: 1,
        maxDuration: 60,
        success(res) {
            const item = res.tempFiles[0]
            isPicture.value = item.fileType === 'image'

            if (item.size > 150 * 1024 * 1024) return showToast('文件过大')

            if (isPicture.value) {
                uni.getImageInfo({
                    src: item.tempFilePath,
                    success(infoResult) {
                        imageSrc.value = infoResult.path
                        imageWidth.value = infoResult.width
                        cropDisplay.value = 'true'
                        imageRadio.value = infoResult.width / infoResult.height
                    }
                })
            } else {
                videoSize = item.size
                thumbTempPath = item.thumbTempFilePath
                sourcePath.value = item.tempFilePath

                const videoRadio = item.width / item.height

                videoHeight.value = 318 / videoRadio
            }
        }
    })
}

function inputTitle(e, total) {
    titleInputRecord = e.detail.value

    if (titleInputRecord.length >= total) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = `曲名长度不可超过${total}`
    }
}

function inputSinger(e, total) {
    singerInputRecord = e.detail.value

    if (singerInputRecord.length >= total) {
        hintDisplay.value = String(Math.random())
        hintMessage.value = `歌手名称长度不过超过${total}`
    }
}

const store = useStore()
const hintDisplay = ref()
const hintMessage = ref()
let titleInputRecord = '', singerInputRecord = ''
const isPicture = ref(true)
const sourcePath = ref()
const $http = inject('$http')
const audio = uni.createInnerAudioContext({ useWebAudioImplement: true })
const videoHeight = ref(0)
let audioPlaying = ref(false)
let videoSize
const fs = uni.getFileSystemManager()
const isUploading = ref(false), hasUploadChunks = ref(0)
let time
const chunksLength = 2 * 1024 * 1024
let currentChunks = 0, netWorkFlag = true
let thumbTempPath = ''

const imageSrc = ref()
const imageWidth = ref()
const imageRadio = ref()
const cropDisplay = ref()
const hasChooseAudio = ref()

let scrollHeight = computed(() => store.state.system.availableHeight)
let uploadProgress = computed(() => {
    const current = store.state.progress.totalBytesSent

    return (currentChunks * chunksLength + current) / videoSize || 0
})

uni.onNetworkStatusChange(res => {
    if (!res.isConnected) {
        netWorkFlag = false
    } else {
        sendVideoForm()
        netWorkFlag = true
    }
})

</script>

<style lang="less">
.container {
    .cropView {
        position: absolute;
        z-index: 10;
        top: 0;
        width: 100%;
    }

    .release-container {
        display: flex;
        flex-direction: column;
        align-items: center;

        .caption {
            width: 118px;
            height: 32px;
            background-color: white;
            text-align: center;
            align-items: center;
            border-radius: 4px;
            margin: 14px auto;
            line-height: 32px;
        }

        .content {
            background-color: white;
            width: 350px;
            padding: 20px 15px 30px;
            border-radius: 12px;
            box-sizing: border-box;
            padding-left: 10px;

            .input {
                margin-bottom: 40px;

                .title-input,
                .singer-input {
                    outline: none;
                    border: none;
                    height: 30px;
                    width: 100%;
                    border-bottom: 1px solid #d5d5d5;
                    margin-bottom: 10px;
                    box-sizing: border-box;
                    padding-left: 10px;
                    font-size: 14px;
                }

                .placeholder-class {
                    font-size: 12px;
                    color: gray;
                }
            }

            .source .abstract {
                color: #767676;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .source {
                .video-picture {
                    .choose {
                        width: 318px;
                        height: 127.2px;
                        border: 1px solid #D1D1D1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 40px;

                        .choose-button {
                            text-align: center;
                            line-height: 32px;
                            width: 120px;
                            height: 32px;
                            color: #0D7377;
                            border: 1px solid #0D7377;
                            opacity: 0.9;
                            font-size: 12px;
                        }

                        .image-video {
                            width: 100%;
                            height: 100%;

                            .choose-image,
                            .choose-video {
                                display: block;
                                width: 100%;
                                height: 100%;
                            }
                        }
                    }
                }

                .audio {
                    .audio-play {
                        border-bottom: 1px solid #d5d5d5;
                        height: 30px;
                        line-height: 30px;
                        box-sizing: border-box;
                        padding: 0 14px;
                        width: max-content;
                        background-color: #00b8a9;
                        color: white;
                        border-radius: 4px;
                        font-size: 12px;
                        text-align: center;
                        position: relative;
                    }

                    .playing {
                        &::after {
                            position: absolute;
                            content: '播放中';
                            top: 50%;
                            left: calc(100% + 5px);
                            transform: translateY(-50%);
                            border-radius: 4px;
                            background-color: #00b8a9;
                            color: white;
                            width: 80px;
                            height: 30px;
                        }
                    }
                }

                .weaken {
                    opacity: 0.3;
                }
            }
        }

        .info {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            width: 350px;
            margin-bottom: 40px;

            .tips {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                font-size: 12px;
                color: #767676;
            }

            .upload {
                height: 30px;
                width: 120px;
                border-radius: 4px;
                text-align: center;
                align-items: center;
                font-size: 12px;
                line-height: 30px;
                color: #eeeeee;
            }

            .button {
                display: flex;

                .submit {
                    width: 80px;
                    height: 34px;
                    border-radius: 4px;
                    font-size: 14px;
                    line-height: 34px;
                    text-align: center;
                    background-color: white;

                    &:last-child {
                        margin-left: 10px;
                        background-color: #0D7377;
                        color: white;
                    }
                }


            }
        }
    }
}
</style>