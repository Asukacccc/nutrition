<template>
    <view class="container">
        <nav-bar isBack="true" title="意见与反馈"></nav-bar>
        <hint-message :message="message" :display="hintDisplay"></hint-message>
        <view class="feedback-container">
            <view class="scroll-view" @touchstart="touchStartHandler" @touchmove="touchMoveHandler"
                @touchend="touchEndHandler">
                <scroll-view scroll-y class="problem-scroll-view"
                    :style="{ height: scrollViewHeight + 'px', marginLeft: marginLeft + 'px' }">
                    <view class="shift" @click="shiftItemHandler">
                        <view :class="['question', writeItemActive ? 'active' : '']">问题书写</view>
                        <view class="middle">|</view>
                        <view :class="['answer', writeItemActive ? '' : 'active']">反馈历史</view>
                    </view>
                    <view class="space-occupy"></view>
                    <form>
                        <view class="box">
                            <view class="word-count">限 <text class="inputted">{{ wordCount }}</text> / 200 字</view>
                            <view class="placeholder" :style="{ opacity: notContent ? 0.5 : 0 }">在此书写意见</view>
                            <textarea class="textarea" auto-focus :style="{ maxHeight: textareaMaxHeight + 'px' }"
                                :maxlength="200" :adjust-position="false" :value="inputValue"
                                @keyboardheightchange="keyboardHeightChange" auto-height @input="inputHandler"
                                :show-confirm-bar="false" @focus="focusHandler"></textarea>
                        </view>
                        <view class="image-display" v-if="imageList.length">
                            <view class="caption">图像附件</view>
                            <view class="word-count">双击以删除&nbsp;&nbsp;限 <text class="inputted">{{ imageCount }}</text> /
                                3 张
                            </view>
                            <view class="image-list">
                                <view class="item" v-for="(item, i) in imageList" :key="i"
                                    @click="doubleClickHandler($event, i)">
                                    <image class="item-image" mode="widthFix" :src="item"></image>
                                </view>
                            </view>
                        </view>
                        <view class="submit">
                            <view class="button" :style="{ opacity: imageCount === 3 ? 0.2 : 1 }" @click="chooseImage">
                                附件
                            </view>
                            <button formType="reset" class="button" :style="{ opacity: canSubmit ? 1 : 0.4 }"
                                @click="submitHandler">提交</button>
                        </view>
                    </form>
                </scroll-view>


                <scroll-view scroll-y class="respond-scroll-view" :style="{ height: scrollViewHeight + 'px' }"
                    refresher-enabled enable-flex :refresher-triggered="refreshTrigger"
                    @scrolltolower="scrollToLowerHandler" @refresherrefresh="refreshHandler">
                    <view class="shift" @click="shiftItemHandler">
                        <view :class="['question', writeItemActive ? 'active' : '']">问题书写</view>
                        <view class="middle">|</view>
                        <view :class="['answer', writeItemActive ? '' : 'active']">反馈历史</view>
                    </view>

                    <view class="space-occupy"></view>
                    <not-content v-if="notFeedbackHistory"></not-content>
                    <view class="answer-list">
                        <view class="item-container" v-for="item in historyList" :key="item.id"
                            :style="{ height: detailDisplayArray[item.id] ? (detailHeightArray[item.id] || 0) + 'px' : '80px' }">
                            <view class="brief" v-if="!detailDisplayArray[item.id]">
                                <view class="brief-text">{{ item.problem.split('\n')[0] }}</view>
                                <view class="respond-time">
                                    <view class="respond" @click="viewChange(item.id)">
                                        <uni-icons type="arrowdown" :color="item.respond ? '#0D7377' : '#686868'">
                                        </uni-icons>
                                        <text class="tips" :style="{ color: item.respond ? '#0D7377' : '#686868' }">{{
                                                item.respond ?
                                                    '有回应' : '暂无回应'
                                        }}</text>
                                    </view>
                                    <view class="time">{{ secondsToTime(item.date) }} <text
                                            :style="{ opacity: 0.5 }">提出</text></view>
                                </view>
                            </view>
                            <view class="specific" v-else :id="'item-' + item.id">
                                <view class="question-part">
                                    <view class="title">反馈问题：</view>
                                    <view class="text" :style="{ whiteSpace: 'pre-wrap' }">{{ item.problem }}</view>
                                    <view class="question-image">
                                        <image v-for="count in item.image_count" :key="count" mode="widthFix"
                                            @load="imageLoadHandler(item.image_count, item.id)" class="image"
                                            :src="`${request.config.baseURL}/user/get-feedback-image/${item.date}-${count - 1}`">
                                        </image>
                                    </view>
                                </view>
                                <view class="respond-part" v-if="item.respond">
                                    <view class="title">回复：</view>
                                    <view class="text">{{ item.respond }}</view>
                                </view>
                                <view class="respond-time">
                                    <view class="respond" @click="viewChange(item.id)">
                                        <uni-icons type="arrowup" :color="item.respond ? '#0D7377' : '#686868'">
                                        </uni-icons>
                                        <text class="tips" :style="{ color: item.respond ? '#0D7377' : '#686868' }">{{
                                                item.respond ?
                                                    '有回应' : '暂无回应'
                                        }}</text>
                                    </view>
                                    <view class="time">{{ secondsToTime(item.date) }} <text
                                            :style="{ opacity: 0.5 }">提出</text></view>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>

import { useStore } from 'vuex'
import { ref, computed, inject, getCurrentInstance, nextTick, watch, reactive } from 'vue'
import showToast from '../../../../utils/showToast.js'
import secondsToTime from '../../../../utils/time.js'
import { onReady } from '@dcloudio/uni-app'
import request from '../../../../fly/index.js'
import hintMessage from '../../../../components/hint-message.vue'
import NotContent from '../../../../components/not-content.vue'

function shiftItemHandler() {
    writeItemActive.value = !writeItemActive.value
    marginLeft.value = marginLeft.value ? 0 : screenWidth.value * -1
}

function imageLoadHandler(count, id) {
    detailDisplayArray['load-' + id]++

    if (detailDisplayArray['load-' + id] === count) {
        nextTick(() => detailDisplayArray['done-' + id] = true)
    }
}

async function submitHandler() {
    const date = Date.now()
    const setText = await $http.setFeedback({ problem: currentContent.trim(), date, count: imageCount.value })

    if (setText.status) return showToast()

    for (let i = 0; i < imageList.value.length; i++) {
        const res = await $http.uploadFeedbackImage({
            tempFilePath: imageList.value[i],
            formData: { date, index: i, extraName: imageList.value[i].split('.')[1] }
        })

        if (res.status) return showToast()
    }

    showToast('反馈成功')

    imageList.value = []
    inputValue.value = ''
    wordCount.value = 0
    canSubmit.value = false
}

function touchStartHandler(e) {
    originMarginLeft = marginLeft.value
    originPageX = e.touches[0].pageX
}

function touchMoveHandler(e) {
    const spaceX = e.touches[0].pageX - originPageX

    if (originMarginLeft + spaceX < screenWidth.value * -1) return
    if (originMarginLeft + spaceX > 0) return
    if (Math.abs(spaceX) < 30) return

    marginLeft.value = originMarginLeft + spaceX
}

function touchEndHandler() {
    if (marginLeft.value >= screenWidth.value / -2) {
        marginLeft.value = 0
        writeItemActive.value = true
    } else {
        marginLeft.value = screenWidth.value * -1
        writeItemActive.value = false
    }
}

function doubleClickHandler(e, index) {
    const currentTime = e.timeStamp

    if (currentTime - lastTime < 300) {
        deleteImage(index)
    } else {
        lastTime = currentTime
    }
}

function deleteImage(i) {
    imageList.value.splice(i, i + 1)
    imageCount.value -= 1
}

function chooseImage() {
    if (!(3 - imageCount.value)) return

    uni.chooseMedia({
        count: 3 - imageCount.value,
        mediaType: ['image'],
        success(chooseResult) {
            for (let i of chooseResult.tempFiles) {
                imageList.value.push(i.tempFilePath)
            }

            imageCount.value += chooseResult.tempFiles.length
        }
    })
}

function inputHandler(e) {
    if (notContent.value) notContent.value = false

    if (e.detail.value.length > 200) return

    if (e.detail.value.trim()) canSubmit.value = true
    else canSubmit.value = false

    currentContent = e.detail.value
    wordCount.value = e.detail.value.length
}

function keyboardHeightChange(e) {
    textareaMaxHeight.value = scrollViewHeight.value - e.detail.height - 120
}

function focusHandler(e) {
    textareaMaxHeight.value = scrollViewHeight.value - e.detail.height - 120
}

async function getFeedback(info, isPush = true) {
    const feedBackResult = await $http.getFeedBack(info)

    setTimeout(() => refreshTrigger.value = false, 100)

    if (feedBackResult.status) {
        return showToast()
    }

    if (!feedBackResult.message.length) {
        hintDisplay.value = String(Math.random())
        message.value = isPush ? '没有更多反馈' : '没有最新反馈'
    }

    historyList.value = isPush ? [...historyList.value, ...feedBackResult.message] : [...feedBackResult.message, ...historyList.value]

    for (let i of feedBackResult.message) {
        detailDisplayArray[i.id] = 0
    }
}

function scrollToLowerHandler() {
    getFeedback({
        start: requestStart,
        length: requestLength
    })

    requestStart += requestLength
}

function refreshHandler() {
    refreshTrigger.value = true

    getFeedback({
        start: 0,
        length: 20,
        boundary: !historyList.value.length ? '0' : historyList.value[0].date
    }, false)
}

function viewChange(id) {
    detailDisplayArray[id] = 1 - detailDisplayArray[id]

    if (detailDisplayArray[id]) {
        if (!detailHeightArray.value[id]) {
            detailDisplayArray['load-' + id] = 0

            function changeHeight() {
                const query = uni.createSelectorQuery().in(instance)

                query.select(`#item-${id}`).boundingClientRect(queryResult => {

                    detailHeightArray.value[id] = queryResult.height + 20
                })

                query.exec()
            }

            nextTick(() => {
                const item = historyList.value.find(v => v.id === id)

                if (!item.image_count) {
                    changeHeight()
                } else {
                    watch(() => detailDisplayArray['done-' + id], () => {
                        changeHeight()
                    })
                }
            })
        }
    }
}


const store = useStore()
const notContent = ref(true)
const textareaMaxHeight = ref()
const wordCount = ref(0)
const canSubmit = ref(false)
const imageList = ref([])
const imageCount = ref(0)
let lastTime = 0, currentContent = ''
const $http = inject('$http')
const inputValue = ref()
const writeItemActive = ref(true)
const marginLeft = ref(0)
let originPageX = 0, originMarginLeft = 0
let requestStart = 0, requestLength = 10
const historyList = ref([])
const detailDisplayArray = reactive({})
const hintDisplay = ref(false), message = ref('')
const refreshTrigger = ref(false)
const detailHeightArray = ref({})
const instance = getCurrentInstance()
const notFeedbackHistory = ref(false)

let scrollViewHeight = computed(() => store.state.system.availableHeight)
let screenWidth = computed(() => store.state.system.screenWidth)

getFeedback({
    start: requestStart,
    length: requestLength
})

requestStart += requestLength
requestLength = 4

watch(historyList, (val) => {
    if (!val.length) notFeedbackHistory.value = true
    else notFeedbackHistory.value = false
}, { immediate: true })

</script>

<style lang="less" scoped>
.container {
    .feedback-container {
        position: relative;
        width: 100vw;

        .scroll-view {
            display: flex;
            overflow: hidden;

            .space-occupy {
                height: 14 + 16 + 32px;
                width: 10px;
                background-color: transparent;
            }

            .shift {
                position: absolute;
                width: 150px;
                font-size: 14px;
                height: 32px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
                border-radius: 4px;
                top: 14px;
                left: 50%;
                transform: translateX(-50%);

                .question {
                    text-align: right;
                }

                .answer {
                    text-align: left;
                }

                .middle {
                    margin: 0 4px;
                }

                .active {
                    font-weight: bold;
                    color: #0D7377;
                }
            }

            .problem-scroll-view {
                flex-shrink: 0;
                width: 100%;
                transition: 0.3s;

                .word-count {
                    position: absolute;
                    bottom: 2px;
                    right: 10px;
                    color: #818181;
                    font-size: 12px;
                    opacity: .5;

                    .inputted {
                        color: #0D7377;
                        font-weight: bold;
                    }
                }

                .image-display {
                    width: 350px;
                    margin: 20px auto;
                    box-sizing: border-box;
                    padding: 20px 20px 25px;
                    background-color: white;
                    border-radius: 6px;
                    position: relative;

                    .caption {
                        margin-bottom: 14px;
                        color: #0D7377;
                        font-size: 16px;
                        font-weight: bold;
                    }

                    .image-list {
                        display: flex;

                        .item {
                            margin-right: 2px;

                            .item-image {
                                display: block;
                                width: 90px;
                            }
                        }
                    }
                }

                .submit {
                    display: flex;
                    justify-content: flex-end;
                    margin: 20px auto 50px;
                    width: 350px;

                    .button {
                        width: 80px;
                        height: 30px;
                        border-radius: 12px;
                        line-height: 30px;
                        text-align: center;
                        font-weight: bold;
                        color: white;
                        background-color: #0D7377;
                        font-size: 14px;

                        &:first-child {
                            color: #0D7377;
                            margin-right: 16px;
                            background-color: white;
                        }

                        &:last-child {
                            margin: 0;
                        }

                        &:hover {
                            opacity: .5;
                        }
                    }
                }

                .box {
                    margin: 0 auto;
                    padding: 20px 12px 30px;
                    box-sizing: border-box;
                    width: 350px;
                    border-radius: 6px;
                    background-color: white;
                    position: relative;
                    min-height: 300px;

                    .textarea {
                        margin: 0 auto;
                        line-height: 26px;
                        font-size: 14px;
                    }

                    .placeholder {
                        font-size: 14px;
                        line-height: 26px;
                        font-style: italic;
                        color: #686868;
                        position: absolute;
                        left: 26px;
                    }
                }
            }

            .respond-scroll-view {
                flex-shrink: 0;
                width: 100%;

                .answer-list {
                    font-size: 14px;

                    .item-container {
                        margin: 0 auto 10px;
                        position: relative;
                        overflow: hidden;
                        transition: height 0.3s;
                        width: 350px;
                        padding: 10px;
                        background-color: white;
                        border-radius: 12px;
                        box-sizing: border-box;

                        .respond-time {
                            font-size: 12px;
                            display: flex;
                            align-items: center;
                            width: calc(100% - 20px);
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            .respond {
                                display: flex;
                                align-items: center;

                                .tips {
                                    margin-left: 4px;
                                }
                            }
                        }

                        .brief,
                        .specific {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            position: relative;
                            margin: 0 auto;
                        }

                        .brief {
                            height: 100%;

                            .brief-text {
                                width: 330px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }

                        }

                        .specific {
                            height: auto;

                            .title {
                                margin-bottom: 4px;
                                font-size: 12px;
                            }

                            .question-part {
                                margin-bottom: 16px;

                                .title {
                                    color: #D72323;
                                }

                                .question-image {
                                    overflow: hidden;
                                    border-radius: 6px;

                                    .image {
                                        width: 150px;
                                        display: block;
                                        margin-bottom: 4px;
                                        margin: 6px auto;
                                    }
                                }
                            }

                            .respond-part {
                                margin-bottom: 10px;

                                .title {
                                    color: #0D7377;
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


