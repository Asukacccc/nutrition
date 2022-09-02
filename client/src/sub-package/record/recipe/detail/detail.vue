<template>
    <view class="container">
        <nav-bar isBack="true" title="饮食详情"></nav-bar>
        <scroll-view scroll-y :style="{ height: scrollViewHeight + 'px' }" class="record-container">
            <view class="space-occupy" :style="{ height: '20px' }"></view>
            <view class="diet">
                <view class="caption">饮食详情</view>
                <view class="list">
                    <view class="total">
                        <view class="total-type">{{ record ? dietNameHandler(record.time) : 0 }}</view>
                        <view class="total-cal">{{ totalCalories ? totalCalories : 0 }}<text
                                :style="{ opacity: '0.3' }">&nbsp;cal</text></view>
                    </view>
                    <view class="item-list" v-if="infoArray.length">
                        <view class="row" v-for="(val, key, i) in infoArray" :key="key">
                            <view class="info">
                                <image class="row-image" :src="`${request.config.baseURL}/food/image/${val.id}`">
                                </image>
                                <view class="name">{{ val.name }}</view>
                            </view>
                            <view class="count" :style="{ opacity: '0.5', fontSize: '14px' }">{{ unitHandler(val.unit,
                                    foodArray[i].split(',')[1])
                            }}</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="journal" v-if="journal">
                <view class="caption">饮食日记</view>
                <view class="item">
                    <view class="title-part">
                        <image class="title-image" src="../../../../static/icon/sub-package/01.png"></image>
                        <view class="title">用餐时间</view>
                    </view>
                    <view class="content-part">
                        <view class="dot" :style="{ width: '302px' }">{{ recordTime }}</view>
                    </view>
                </view>
                <view v-for="(item, i) in journalContent" :key="i">
                    <view class="item" v-if="item.choose !== '-'">
                        <view class="title-part">
                            <image class="title-image" :src="item.image"></image>
                            <view class="title">{{ item.title }}</view>
                        </view>
                        <view class="content-part">
                            <view v-for="(val2, i2) in item.choice" :key="i2">
                                <view :class="['dot', (item.choose - 0) === i2 ? 'active' : '']">{{ val2 }}</view>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="item" v-if="journal.text_record">
                    <view class="title-part">
                        <image class="title-image" src="../../../../static/icon/sub-package/10.png"></image>
                        <view class="title">其他感受</view>
                    </view>
                    <view class="content-part">
                        <view class="dot" :style="{ padding: '6px 10px', width: '294px' }">{{ journal ?
                                journal.text_record : ''
                        }}</view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { onLoad } from '@dcloudio/uni-app'
import { useStore } from 'vuex'
import { inject, reactive, ref, computed } from 'vue'
import showToast from '../../../../utils/showToast'
import request from '../../../../fly/index'
import store from '../../../../store'

function recordTimeHandler(time) {
    const date = new Date(Number(time))
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()

    recordTime.value = `${year}年${month}月${day}日  ${hour}:${minute}`
}

function getRecordJournal() {
    return new Promise(async (resolve, reject) => {
        const requestResult = await $http.getRecordJournal({ id })

        if (requestResult.status) {
            showToast()
            return reject()
        }

        journal.value = requestResult.message[0]

        if (requestResult.message.length) recordTimeHandler(journal.value.time)

        resolve()
    })
}

function unitHandler(text, count) {
    const back = text.match(/(?<=\d+\/?\d?)[^g\d]/)[0]
    const forward = text.match(/\d+\/?\d*(?=\D+)/)[0]

    return Number(forward) * count + back
}

function dietNameHandler(itemId) {
    switch (itemId) {
        case 0: return '早餐'
        case 1: return '午餐'
        case 2: return '晚餐'
        case 3: return '加餐'
    }
}

function getFoodInfo(foodId) {
    return new Promise(async (resolve, reject) => {
        const requestResult = await $http.getSingleFoodInfo({ id: foodId })

        if (requestResult.status) {
            showToast()
            return reject()
        }

        resolve(requestResult.message)
    })
}

function getRecordInfo() {
    return new Promise(async resolve => {
        const requestResult = await $http.getDietRecord({
            single: id,
            start: 0,
            length: 1,
            today: 1,
            boundary: 0
        })

        if (requestResult.status) return showToast()

        resolve(requestResult.message[0])
    })
}

const $http = inject('$http')
let id, record
const infoArray = reactive([])
const caloriesArray = reactive([])
const foodArray = reactive([])
const totalCalories = ref(0)
const journal = ref(0)
const recordTime = ref(0)

const scrollViewHeight = computed(() => store.state.system.availableHeight)

const journalContent = [
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
]

onLoad(async options => {
    id = Number(options.id)

    record = await getRecordInfo()

    foodArray.length = 0
    foodArray.push.apply(foodArray, record.food_id_set.split('-'))

    let promiseArray = []

    for (let i of foodArray) {
        promiseArray.push(getFoodInfo(i.split(',')[0]))
    }

    promiseArray.push(getRecordJournal())

    Promise.all(promiseArray).then(v => {
        let position = 0

        v.pop()

        infoArray.push.apply(infoArray, v)

        for (let i of infoArray) {
            totalCalories.value += Number(i.heat) * foodArray[position++].split(',')[1]
        }

        if (journal.value) {
            for (let i = 0; i < journal.value.option_record.length; i++) {
                journalContent[i].choose = journal.value.option_record[i]
            }
        }
    }).catch(() => {
        showToast()
    })
})

</script>

<style lang="less" scoped>
.container {
    .record-container {

        .diet,
        .journal {
            .caption {
                color: #0D7377;
                background-color: #4FEAD0;
                width: 94px;
                height: 34px;
                border-bottom-right-radius: 10px;
                line-height: 34px;
                text-align: center;
                margin-bottom: 20px;
            }
        }

        .diet {
            width: 350px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);

            .list {
                margin: 0 auto;
                width: 340px;
                padding: 10px 16px;
                box-sizing: border-box;
                border-radius: 10px;

                .total {
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    position: relative;

                    &::after {
                        position: absolute;
                        content: '';
                        height: 2px;
                        width: 500px;
                        background-color: gray;
                        opacity: .15;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%) scale(0.5);
                    }

                    .total-type,
                    .total-cal {
                        font-weight: bold;
                    }
                }

                .item-list {
                    margin: 8px auto;
                    font-size: 14px;

                    .row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 6px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        .info {
                            display: flex;
                            align-items: center;

                            .row-image {
                                display: block;
                                width: 24px;
                                height: 24px;
                            }

                            .name {
                                margin-left: 8px;
                            }
                        }
                    }
                }
            }
        }

        .journal {
            width: 350px;
            box-sizing: border-box;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            padding: 0 0 8px;

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
    }
}
</style>