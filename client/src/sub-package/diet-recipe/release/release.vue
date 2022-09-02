<template>
    <view class="container">
        <nav-bar isBack="true" title="食谱"></nav-bar>
        <view class="cropView">
            <image-crop :src="imageSrc" cropRadio="1" :imageWidth="imageWidth" :display="cropDisplay"
                :imageRadio="imageRadio" @closeCropBox="closeCropBox" cropTitle="封面图片裁剪" @getCropResult="getCropResult">
            </image-crop>
        </view>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <scroll-view scroll-y class="release-container" @scroll="scrollHandler"
            :style="{ height: scrollHeight + 'px' }">
            <view :style="{ height: '14px' }"></view>
            <view class="caption">发布</view>
            <view class="input-container">
                <input type="text" class="title-input" @input="titleHandler" placeholder="- 食谱名称 -"
                    placeholder-style="color: #929292" maxlength="10" />
                <view class="content-input">
                    <view v-for="v in textareaDisplayObj" :key="v.id" class="list-item">
                        <view class="item-input" v-if="v.display"
                            :data-display="v.display && v.id <= activeIndex ? 'true' : 'false'">
                            <view class="input-area">
                                <view class="index">{{ v.id + 1 }}.</view>
                                <view class="text">
                                    <textarea class="text-input" @focus="focusHandler" :data-index="v.id"
                                        :show-confirm-bar="false" :focus="v.id === activeIndex" :adjust-position="false"
                                        @blur="blurHandler" @input="inputHandler($event, v.id)"
                                        maxlength="200"></textarea>
                                </view>
                                <image src="../../../static/icon/sub-package/appendix.png"
                                    @click="chooseImageHandler(v.id)"
                                    :class="['image-choose', imageSrcArray[v.id] ? 'hidden' : 0]"></image>
                            </view>
                            <image class="image-display" v-if="imageSrcArray[v.id]" mode="widthFix"
                                @click="doubleClickHandler($event, v.id)" :src="imageSrcArray[v.id]"></image>
                        </view>
                    </view>
                </view>
            </view>
            <view class="info">
                <view class="tips">
                    <view :style="{ opacity: '0.6', marginBottom: '4px' }">tips: </view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">1. 最多可编辑十条</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">2. 每条最多可编辑一张图片</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">3. 双击删除图片</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">4. 每项字数限200</view>
                    <view :style="{ color: '#0D7377', fontWeight: 'bold', textIndent: '4px' }">4. 标题字数限10</view>
                </view>
                <view class="button" @click="submitHandler">发布</view>
            </view>
            <view v-show="keyboard" :style="{ height: `${keyboard}px` }"></view>
        </scroll-view>
    </view>
</template>

<script setup>

import { reactive, ref, computed, inject } from 'vue'
import { useStore } from 'vuex'
import ImageCrop from '../../../components/image-crop.vue'
import HintMessage from '../../../components/hint-message.vue'
import showToast from '../../../utils/showToast'

function getFileExtName(fileSrc) {
    return fileSrc.slice(fileSrc.lastIndexOf('.'))
}

function titleHandler(e) {
    if (e.detail.value.length >= 10) {
        hintDisplay.value = Math.random()
        hintMessage.value = '标题字数限为 10 字'
        return
    }

    titleInputRecord = e.detail.value.trim()
}

async function submitHandler() {
    if (!titleInputRecord) {
        hintDisplay.value = Math.random()
        hintMessage.value = '标题不可为空'
        return
    }

    let notContentFlag = -1, validIndex

    for (let i = 0; i < 10; i++) {
        if (!contentArray[i]) {
            notContentFlag = i
            if (validIndex === undefined) validIndex = i

            if (imageSrcArray[i]) {
                hintDisplay.value = Math.random()
                hintMessage.value = `第 ${notContentFlag + 1} 项内容为空`
                return
            }
            continue
        }

        if (contentArray[i] && notContentFlag !== -1) {
            hintDisplay.value = Math.random()
            hintMessage.value = `第 ${notContentFlag + 1} 项内容为空`
            return
        }
    }

    let config = '', incrementIndex = 0
    const time = Date.now()
    let imageName = []

    for (let i = 0; i < 10; i ++) {
        if (imageSrcArray[i]) {
            const res = await $http.uploadRecipeImage({
                path: imageSrcArray[i],
                name: `${time}-${incrementIndex}${getFileExtName(imageSrcArray[i])}`
            })

            if (res.status) showToast('上传失败')

            imageName.push(`${time}-${incrementIndex++}${getFileExtName(imageSrcArray[i])}`)
            config += '1'
        } else {
            config += '0'
        }
    }

    const setResult = await $http.setRecipe({
        imageName,
        text: contentArray,
        config,
        time,
        avatar: store.state.user.avatar,
        title: titleInputRecord,
        nickname:  store.state.user.nickname
    })

    if (setResult.status) return showToast('上传失败')

    uni.navigateBack()
}

function inputHandler(e, id) {
    if (e.detail.value.length >= 200) {
        hintDisplay.value = Math.random()
        hintMessage.value = `第 ${id + 1} 项限字数已达上限`
        return
    }

    contentArray[id] = e.detail.value.trim()
}

function doubleClickHandler(e, id) {
    const clickTime = e.timeStamp

    if (clickTime - lastClick < 300) {
        imageSrcArray[id] = false
    } else {
        lastClick = clickTime
    }
}

function blurHandler() {
    keyboard.value = 0
}

function scrollHandler(e) {
}

function getCropResult(res) {
    imageSrcArray[chooseImageIndex] = res.tempFilePath
    closeCropBox()
}

function closeCropBox() {
    cropDisplay.value = ''
}

function chooseImageHandler(id) {
    chooseImageIndex = id

    uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        success(chooseResult) {
            const item = chooseResult.tempFiles[0]

            uni.getImageInfo({
                src: item.tempFilePath,
                success(infoResult) {
                    imageSrc.value = infoResult.path
                    imageWidth.value = infoResult.width
                    cropDisplay.value = 'true'
                    imageRadio.value = infoResult.width / infoResult.height
                }
            })
        }
    })
}

function focusHandler(e) {
    const index = e.target.dataset.index

    keyboard.value = e.detail.height

    if (index >= 9) return

    if (!textareaDisplayObj[index + 1].display) textareaDisplayObj[index + 1].display = true
    activeIndex.value = index
}

const textareaDisplayObj = reactive([])
const activeIndex = ref(-1)
const store = useStore()
const imageSrcArray = reactive([])
let chooseImageIndex = 0
const keyboard = ref(0)
let lastClick = 0
let contentArray = [], titleInputRecord
const hintDisplay = ref(), hintMessage = ref()
const $http = inject('$http')

let topBarHeight = computed(() => store.state.system.statusHeight + store.state.system.navigationHeight)

const imageSrc = ref()
const imageWidth = ref()
const cropDisplay = ref()
const imageRadio = ref()

let scrollHeight = computed(() => store.state.system.availableHeight)

for (let i = 0; i < 10; i++) {
    textareaDisplayObj[i] = {}
    textareaDisplayObj[i].id = i
    textareaDisplayObj[i].display = false
}

textareaDisplayObj[0].display = true
textareaDisplayObj[1].display = true

</script>

<style lang="less" scoped>
.container {
    .cropView {
        position: absolute;
        z-index: 10;
        top: 0;
        width: 100%;
    }

    .release-container {
        .caption {
            width: 118px;
            height: 32px;
            background-color: white;
            text-align: center;
            align-items: center;
            border-radius: 4px;
            margin: 0 auto 14px;
            line-height: 32px;
            position: relative;
        }

        .input-container {
            background-color: white;
            width: 350px;
            padding: 20px 8px 16px;
            border-radius: 12px;
            box-sizing: border-box;
            margin: 0 auto;
            overflow: scroll;

            .title-input {
                outline: none;
                border: none;
                margin: 0 auto 10px;
                text-align: center;
                font-weight: bold;
            }

            .content-input {
                margin: 0 auto;

                .list-item {
                    &:not(:last-child) {
                        .item-input[data-display='true']::after {
                            position: absolute;
                            height: 2px;
                            bottom: -16px;
                            width: 400px;
                            left: 50%;
                            transform: translateX(-50%) scale(0.5);
                            background-color: #00b8a9;
                            content: '';
                            opacity: 0.15;
                        }
                    }

                }

                .item-input {
                    width: 100%;
                    margin-bottom: 40px;
                    position: relative;

                    .input-area {
                        display: flex;
                        width: 100%;

                        .index {
                            width: 24px;
                            font-size: 12px;
                            line-height: 14px;
                            height: 24px;
                            line-height: 24px;
                            text-align: right;
                        }

                        .text {
                            flex: 1;
                            margin: 0 10px;

                            .text-input {
                                font-size: 14px;
                                width: 100%;
                                line-height: 24px;
                                vertical-align: top;
                                background-image: url('../../../static/image/background/line.png');
                                background-repeat: repeat;
                                background-size: 200px 24px;
                                height: 280px;
                            }
                        }

                        .image-choose {
                            align-self: flex-end;
                            width: 20px;
                            height: 20px;
                            display: block;
                            flex-shrink: 0;
                        }

                        .hidden {
                            opacity: 0;
                            pointer-events: none;
                        }
                    }

                    .image-display {
                        width: 140px;
                        display: block;
                        margin: 14px auto;
                    }
                }
            }
        }

        .info {
            margin: 20px auto 40px;
            display: flex;
            justify-content: space-between;
            width: 350px;

            .tips {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                font-size: 12px;
                color: #767676;
            }

            .button {
                width: 80px;
                height: 34px;
                border-radius: 4px;
                font-size: 14px;
                line-height: 34px;
                text-align: center;
                background-color: #0D7377;
                color: white;
            }
        }
    }
}
</style>