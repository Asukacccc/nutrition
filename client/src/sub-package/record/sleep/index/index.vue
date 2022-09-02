<template>
    <view class="container">
        <nav-bar isBack="true" title="睡眠记录"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <sleep-detail class="sleep-detail" :display="sleepDisplay" :respite="displayRespite" :interval="displayInterval"
            @closeDisplay="closeDisplay"></sleep-detail>
        <sleep-record :display="longRecordDisplay" :respite="longRecordRespite" @closeRecord="closeRecord"
            @confirmRecord="confirmRecord">
        </sleep-record>
        <scroll-view scroll-y :style="{ 'height': scrollViewHeight + 'px' }" class="index-container">
            <uni-calendar :insert="true" :startDate="`${year}-${month}-${day}`" :endDate="`${year}-${month}-${day}`"
                :date="`${year}-${month}-${day}`"></uni-calendar>
            <view class="button">
                <view class="longTerm" @click="recordLongSleep">记录夜间睡眠</view>
                <view class="shortTerm" @click="recordShortSleep">记录短期休憩</view>
            </view>
            <view class="shift">
                <view :class="['today', isToday ? 'active' : '']" @click="changePart('today')">当天记录</view>
                <view :class="['past', isToday ? '' : 'active']" @click="changePart('past')">过去记录</view>
            </view>
            <view class="today-past">
                <view class="not" v-if="!sleepRecord.length">{{ isToday ? '今天没有记录' : '过去没有记录' }}</view>
                <view class="list" v-else>
                    <view class="item" v-for="v in sleepRecord" :key="v.id" :data-id="v.id" @click="showDetail">
                        <view class="info">
                            <view class="sleep-name" :style="{ color: v.respite - 0 ? '#6639a6' : 'black' }">{{
                                    v.respite - 0 ? '休憩' : '夜间'
                            }}</view>
                            <view class="time">{{ timeHandler(v.sleep_interval.split(',')[0]) }}</view>
                        </view>
                        <view class="date" v-if="!isToday">{{ time(v.sleep_interval.split(',')[0]) }}</view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { computed, inject, reactive, ref } from 'vue'
import UniCalendar from '@dcloudio/uni-ui/lib/uni-calendar/uni-calendar.vue'
import { useStore } from 'vuex'
import showToast from '../../../../utils/showToast'
import HintMessage from '../../../../components/hint-message.vue'
import SleepDetail from '../../../../components/sleep-detail.vue'
import time from '../../../../utils/time'
import SleepRecord from '../../../../components/sleep-record.vue'
import { onHide } from '@dcloudio/uni-app'

function recordShortSleep() {
    uni.navigateTo({
        url: '/sub-package/record/sleep/short-term/short-term'
    })
}

function confirmRecord(respite, sleep_interval, id) {
    todayOriginTime = getTodayTime()

    if (sleep_interval.split(',')[0] < todayOriginTime) {
        if (isToday.value) {
            anotherList.unshift({
                id,
                respite,
                sleep_interval
            })
        } else {
            sleepRecord.unshift({
                id,
                respite,
                sleep_interval
            })
        }
    } else {
        if (isToday.value) {
            sleepRecord.unshift({
                id,
                respite,
                sleep_interval
            })
        } else {
            anotherList.unshift({
                id,
                respite,
                sleep_interval
            })
        }
    }

    closeRecord()
}

function recordLongSleep() {
    longRecordDisplay.value = true
    longRecordRespite.value = 0
}

function closeRecord() {
    longRecordDisplay.value = false
}

function closeDisplay() {
    sleepDisplay.value = false
}

function showDetail(e) {
    const id = e.currentTarget.dataset.id
    const item = [...anotherList, ...sleepRecord].find((v => v.id === id))

    displayInterval.value = item.sleep_interval
    displayRespite.value = item.respite
    sleepDisplay.value = true
}

function changePart(part) {
    if (part === 'today' && isToday.value) return
    if (part === 'past' && !isToday.value) return

    let tempArray = anotherList

    isToday.value = !isToday.value

    anotherList = JSON.parse(JSON.stringify(sleepRecord))
    sleepRecord.length = 0
    sleepRecord.push(...tempArray)
}

function timeHandler(time) {
    const date = new Date(Number(time))

    const hour = date.getHours()
    const minute = date.getMinutes()

    return `${hour > 9 ? hour : '0' + hour} : ${minute > 9 ? minute : '0' + minute}`
}

function getTodayTime() {
    const date = new Date()

    year = date.getFullYear()
    month = date.getMonth()
    day = date.getDate()

    return new Date(year, month, day).getTime()
}

async function requestRecord(info, list) {
    const requestResult = await $http.getSleepRecord(info)

    if (requestResult.state) return showToast()

    if (!requestResult.message.length) {
        hintDisplay.value = Math.random()
        hintMessage.value = `${isToday.value ? '今日' : '过去'}记录已加载完毕`

        return
    }

    list.push.apply(list, requestResult.message)
}

const store = useStore()
let start = 0, length = 10
let pastStart = 0, pastLength = 10
const $http = inject('$http')
let todayOriginTime = getTodayTime()
const sleepRecord = reactive([])
let anotherList = []
const isToday = ref(true)
const hintDisplay = ref('')
const hintMessage = ref('')
let year, month, day
const displayInterval = ref()
const displayRespite = ref()
const sleepDisplay = ref(false)
const longRecordDisplay = ref(false), longRecordRespite = ref()

const scrollViewHeight = computed(() => store.state.system.availableHeight)

requestRecord({
    start,
    length,
    today: 1,
    boundary: todayOriginTime
}, sleepRecord)

start += length
length = 4

requestRecord({
    start: pastStart,
    length: pastLength,
    today: 0,
    boundary: todayOriginTime
}, anotherList)

pastStart += pastLength
pastLength = 4

onHide(() => {
    if (isToday.value) {
        store.commit('sleep/setRecordList', sleepRecord)
    } else {
        store.commit('sleep/setRecordList', anotherList)
    }
})

</script>

<style lang="less" scoped>
.container {

    /deep/ .display-container {
        z-index: 2;
    }

    /deep/ .shallow-container {
        z-index: 1;
    }

    /deep/ .uni-calendar__backtoday,
    /deep/ .uni-calendar__header-btn-box {
        pointer-events: none;
        opacity: 0;
    }

    .button {
        margin: 14px auto 20px;
        display: flex;
        width: 300px;
        justify-content: space-between;
        align-items: center;

        .longTerm,
        .shortTerm {
            width: 100px;
            font-size: 12px;
            text-align: center;
            height: 40px;
            border-radius: 24px;
            color: white;
            line-height: 40px;
            background-color: #0D7377;
        }
    }

    .shift {
        margin-left: 32px;
        display: flex;

        .today,
        .past {
            height: 30px;
            width: 100px;
            line-height: 30px;
            text-align: center;
            background-color: white;
            font-size: 14px;
            color: gray;
            border-radius: 4px;
        }

        .past {
            margin-left: 18px;
        }

        .active {
            color: #0D7377;
            font-weight: bold;
        }
    }

    .today-past {
        .not {
            width: calc(100% - 32 * 2px);
            height: 40px;
            line-height: 40px;
            border-radius: 10px;
            color: #8C8C8C;
            background-color: #E6E6E6;
            margin: 20px auto 14px;
            text-align: center;
        }

        .list {
            .item {
                font-size: 12px;
                width: calc(100% - 32 * 2px);
                margin: 16px auto 14px;
                box-sizing: border-box;
                padding: 0 16px;
                box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
                background-color: white;
                height: 40px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .info {
                    width: max-content;
                    display: flex;
                    align-items: center;
                    height: 40px;

                    .sleep-name {
                        font-weight: bold;
                    }

                    .time {
                        margin-left: 14px;
                    }
                }

                .date {
                    margin-left: 16px;
                    flex: 1;
                    overflow: hidden;
                    width: 0;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    opacity: 0.5;
                    text-align: right;
                }
            }
        }
    }
}
</style>