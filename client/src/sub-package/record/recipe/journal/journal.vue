<template>
    <view class="container">
        <nav-bar isBack="true" title="日记填写"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <scroll-view scroll-y enable-flex :style="{ height: scrollViewHeight + 'px' }" @scroll="scrollHandler"
            :scroll-top="scrollTopSet" class="journal-container">
            <view class="journal">
                <view class="item">
                    <view class="title-part">
                        <image class="title-image" src="../../../../static/icon/sub-package/01.png"></image>
                        <view class="title">用餐时间</view>
                    </view>
                    <view class="content-part">
                        <view class="dot" :style="{ width: '302px' }">
                            <picker mode="time" start="00:00" :value="recordTime" end="23:59" @change="timeChange">
                                <view class="picker">{{ recordDate }}&nbsp;&nbsp;&nbsp;{{ recordTime
                                }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<text :style="{ opacity: '0.5' }">点击可修改</text>
                                </view>
                            </picker>
                        </view>
                    </view>
                </view>
                <view class="item" v-for="(item, i) in journalContent" :key="i">
                    <view class="title-part">
                        <image class="title-image" :src="item.image"></image>
                        <view class="title">{{ item.title }}</view>
                    </view>
                    <view class="content-part">
                        <view @click="selectItem(i, i2)" :class="['dot', (item.choose - 0) === i2 ? 'active' : '']"
                            v-for="(val2, i2) in item.choice" :key="i2">{{ val2 }}</view>
                    </view>
                </view>
                <view class="item">
                    <view class="title-part">
                        <image class="title-image" src="../../../../static/icon/sub-package/10.png"></image>
                        <view class="title">其他感受</view>
                    </view>
                    <view class="content-part">
                        <textarea class="dot text-input" :show-confirm-bar="false" placeholder="非必须(最多200字)"
                            @input="inputHandler" maxlength="200" :adjust-position="false" @focus="focusHandler"
                            @blur="blurHandler" :value="textRecord"
                            :style="{ padding: '6px 10px', width: '294px', marginBottom: marginBottom + 6 + 'px' }" />
                    </view>
                </view>
            </view>
            <view class="outer">
                <view class="button" @click="back">确认</view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import HintMessage from '../../../../components/hint-message.vue'
import { onUnload } from '@dcloudio/uni-app'

function backToBefore() {
    const dateArray = recordDate.split('-')
    const year = dateArray[0]
    const month = dateArray[1] - 1
    const date = dateArray[2]
    const hour = recordTime.value.split(' : ')[0]
    const minute = recordTime.value.split(' : ')[1]

    const time = new Date(year, month, date, hour, minute, 0).getTime()
    const option = optionStr
    const text = textRecord
    
    store.commit('diet/setJournalContent', {
        time,
        option,
        text
    })

    if (optionStr.indexOf('-') === -1) {
        store.commit('diet/setJournalStatus', 2)
    }
}

function back() {
    backToBefore()
    uni.navigateBack()
}

function scrollHandler(e) {
    scrollTopValue = e.detail.scrollTop
}

function focusHandler(e) {
    query.select('.text-input').boundingClientRect(res => {
        const bottom = res.bottom

        marginBottom.value = e.detail.height + bottom - scrollViewHeight.value - topBarHeight.value + 10
        setTimeout(() => {
            scrollTopSet.value = marginBottom.value + scrollTopValue
        }, 120)
    })

    query.exec()
}

function blurHandler() {
    marginBottom.value = 0
    scrollTopSet.value = scrollTopValue
}

function timeChange(e) {
    const hour = e.detail.value.split(':')[0]
    const minute = e.detail.value.split(':')[1]

    recordTime.value = `${hour / 1} : ${minute / 1}`
}

function inputHandler(e) {
    if (e.detail.value.length >= 200) {
        hintDisplay.value = Math.random()
        hintMessage.value = '最多200字'
    }

    textRecord = e.detail.value
}

function selectItem(i, i2) {
    journalContent[i].choose = i2
    optionStr = optionStr.substring(0, i) + i2 + optionStr.substring(i + 1)
}

const store = useStore()
const journalContent = reactive([
    {
        title: '属于哪一餐',
        image: '../../../../static/icon/sub-package/01.png',
        choice: ['早餐', '午餐', '晚餐', '加餐']
    },
    {
        title: '进食的理由',
        image: '../../../../static/icon/sub-package/02.png',
        choice: ['饿了', '嘴巴馋', '到饭点了', '社交', '无聊', '压力大', '不想浪费', '其他']
    },
    {
        title: '进食前的渴望程度',
        image: '../../../../static/icon/sub-package/03.png',
        choice: ['非吃不可', '比较渴望', '有点渴望', '不太渴望', '完全不渴望']
    },
    {
        title: '进食前的饥饱感',
        image: '../../../../static/icon/sub-package/04.png',
        choice: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
        title: '进食后的饥饱感',
        image: '../../../../static/icon/sub-package/04.png',
        choice: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
        title: '进食过程持续了多久',
        image: '../../../../static/icon/sub-package/05.png',
        choice: ['小于5分钟', '5~10分钟', '10~20分钟', '20~30分钟', '30分钟以上']
    },
    {
        title: '食物是否健康',
        image: '../../../../static/icon/sub-package/06.png',
        choice: ['健康', '不健康', '不确定']
    },
    {
        title: '进食后的心理感受',
        image: '../../../../static/icon/sub-package/07.png',
        choice: ['快乐', '满足', '平常', '心情复杂', '焦虑', '愧疚', '没感觉']
    },
    {
        title: '在哪里进食',
        image: '../../../../static/icon/sub-package/08.png',
        choice: ['公司', '学校', '餐厅', '家里', '车里', '公共场所', '其他']
    },
    {
        title: '和谁一起进食',
        image: '../../../../static/icon/sub-package/09.png',
        choice: ['朋友', '家人', '伴侣', '同事', '同学', '宠物', '一个人', '其他']
    }
])
const hintDisplay = ref()
const hintMessage = ref()
const recordTime = ref('0:0')
const marginBottom = ref(6)
let scrollTopValue = 0
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
let scrollTopSet = ref(0)
let optionStr = store.state.diet.journalContent.option || '-'.repeat(10)
let textRecord = store.state.diet.journalContent.text || ''

const scrollViewHeight = computed(() => store.state.system.availableHeight)
const topBarHeight = computed(() => store.state.system.statusHeight + store.state.system.navigationHeight)

const recordDate = (function () {
    const secondsTime = new Date(Number(store.state.diet.journalContent.time || store.state.diet.todayTime))
    const year = secondsTime.getFullYear()
    const month = secondsTime.getMonth() + 1
    const date = secondsTime.getDate()

    return `${year}-${month}-${date}`
})()

const option_record = store.state.diet.journalContent.option

if (option_record) {
    for (let i = 0; i < journalContent.length; i++) {
        journalContent[i].choose = option_record[i]
        optionStr = optionStr.substring(0, i) + option_record[i] + optionStr.substring(i + 1)
    }
}

recordTime.value = (function () {
    const secondsTime = (function () {
        const time = store.state.diet.journalContent.time

        return time ? new Date(time) : new Date()
    })()

    const hour = secondsTime.getHours()
    const minute = secondsTime.getMinutes()

    return `${hour} : ${minute}`
})()

onUnload(() => {
    backToBefore()
})

</script>

<style lang="less" scoped>
.container {
    .journal-container {
        display: flex;
        margin: 0 auto;
        width: 100vw;
        flex-direction: column;
        align-items: center;

        .journal {
            width: 350px;
            box-sizing: border-box;
            margin: 14px auto 20px;
            background-color: white;
            border-radius: 10px;
            padding: 10px 0 8px;

            .item {
                width: 314px;
                box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
                padding: 10px;
                margin: 0 auto 10px;
                border-radius: 10px;

                .title-part {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;

                    .title-image {
                        display: block;
                        width: 20px;
                        height: 20px;
                    }

                    .title {
                        margin-left: 8px;
                        font-weight: 16px;
                    }
                }

                .content-part {
                    display: flex;
                    flex-wrap: wrap;

                    .dot {
                        max-width: 302px;
                        flex-shrink: 0;
                        background-color: #E8E8E8;
                        padding: 2px 6px;
                        border-radius: 2px;
                        font-size: 12px;
                        margin-right: 8px;
                        margin-bottom: 6px;
                        word-break: break-all;
                        white-space: pre-line;
                    }

                    .active {
                        color: white;
                        background-color: #003234;
                    }
                }
            }
        }

        .outer {
            width: 350px;
            margin: 0 auto;

            .button {
                float: right;
                height: 40px;
                width: 100px;
                border-radius: 20px;
                background-color: #0D7377;
                color: white;
                line-height: 40px;
                text-align: center;
                margin-bottom: 40px;
            }
        }
    }
}
</style>