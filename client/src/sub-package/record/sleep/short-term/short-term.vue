<template>
    <view class="container" :style="{ backgroundImage: `url(${request.config.baseURL}/picture/get/short-term)` }">
        <nav-bar :isBack="true" title="小憩" :whiteFlag="true" class="nav-bar"></nav-bar>
        <alert-clock :display="alertClockDisplay" @closeAlertClockSet="closeAlertClockSet"
            @confirmAlertClockSet="confirmAlertClockSet" class="component"></alert-clock>
        <confirm-box :display="confirmBoxDisplay" :topTitle="topTitle" :middleTitle="middleTitle" class="confirm-box"
            @deleteResult="handlerResult"></confirm-box>
        <sleep-record :display="shortRecordDisplay" :respite="1" @closeRecord="closeRecord"
            @confirmRecord="confirmRecord" :transparentBar="true" class="component">
        </sleep-record>
        <view class="short-container" :style="{ height: shortTermHeight + 'px' }">
            <view class="alert-clock" @click="setAlertClock">{{ hasSetAlertClock ? '关闭闹铃' : '点击开启闹铃' }}</view>
            <view class="alert-result">
                <view class="alert-audio">{{ hasSetAlertClock ? `闹铃设在 ${timeHandler(alertResult[1])}` : '' }}</view>
            </view>
            <view class="record">
                <view class="button" @click="pageToSleep">开启小憩</view>
                <view class="manual" @click="manualHandler">手动记录小憩</view>
            </view>
        </view>
    </view>
</template>

<script setup>

import request from '../../../../fly/index'
import { useStore } from 'vuex'
import { computed, reactive, ref, inject } from 'vue'
import AlertClock from '../../../../components/alert-clock.vue'
import timeHandler from '../../../../utils/sleepTimeFormat'
import ConfirmBox from '../../../../components/confirm-box.vue'
import { onShow } from '@dcloudio/uni-app'
import time from '../../../../utils/time'
import showToast from '../../../../utils/showToast'
import SleepRecord from '../../../../components/sleep-record.vue'

function confirmRecord(respite, sleep_interval, id) {
    const list = store.state.sleep.recordList

    list.unshift({
        id,
        respite,
        sleep_interval
    })

    closeRecord()
}

function closeRecord() {
    shortRecordDisplay.value = false
}

function manualHandler() {
    shortRecordDisplay.value = true
}

function computedRespiteTime(v) {
    const time = new Date(v)
    const hour = time.getHours()
    const minute = time.getMinutes()

    const current = new Date()

    if (current.getDate() !== time.getDate()) {
        return `${time(v)} ${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}`
    }

    return `${hour}:${minute}`
}

async function handlerResult(flag) {
    if (!flag) {
        store.commit('sleep/clearRespiteInfo')
    } else {
        const list = store.state.sleep.recordList
        const sleep_interval = `${store.state.sleep.respiteStartTime},${store.state.sleep.respiteCloseTime}`

        const setResult = await $http.setSleepRecord({
            respite: 1,
            sleepInterval: sleep_interval
        })

        if (setResult.status) return showToast('存储失败')

        list.unshift({
            id: setResult.message,
            sleep_interval,
            respite: 1
        })
        store.commit('sleep/clearRespiteInfo')
    }

    confirmBoxDisplay.value = 'false'
}

function pageToSleep() {
    uni.navigateTo({
        url: '/sub-package/record/sleep/sleeping/sleeping'
    })
}

function confirmAlertClockSet() {
    alertResult.splice(0, 2, ...[store.state.sleep.alertClockAudio.name, store.state.sleep.alertClockTime])

    store.commit('sleep/setHasAlertClock', true)

    closeAlertClockSet()
}

function closeAlertClockSet() {
    alertClockDisplay.value = false
}

function setAlertClock() {
    if (!hasSetAlertClock.value) {
        alertClockDisplay.value = true
    } else {
        store.commit('sleep/clearRespiteInfo')
    }
}

const store = useStore()
const alertClockDisplay = ref()
const hasSetAlertClock = computed(() => store.state.sleep.hasSetAlertClock)
const alertResult = reactive([])
const confirmBoxDisplay = ref('false')
const topTitle = ref(), middleTitle = ref()
const $http = inject('$http')
const shortRecordDisplay = ref(false)

const shortTermHeight = computed(() => store.state.system.availableHeight)

onShow(() => {
    const start = store.state.sleep.respiteStartTime
    const end = store.state.sleep.respiteCloseTime

    if (start) {
        confirmBoxDisplay.value = 'true'
        topTitle.value = '是否要记录此次小憩'
        middleTitle.value = `自 ${computedRespiteTime(start)} 到 ${computedRespiteTime(end)}`
    }
})
</script>

<style lang="less" scoped>
.container {
    height: 100%;
    width: 100%;
    background-size: cover;

    /deep/ .choose-container {
        z-index: 3;
    }

    .component /deep/ .shallow-container {
        z-index: 1;
    }

    .nav-bar /deep/ .status-bar,
    .nav-bar /deep/ .navigation-bar {
        background-color: transparent;
    }

    .nav-bar /deep/ .container {
        box-shadow: none;
    }

    .confirm-box /deep/ .container .box-container .content .button .confirm {
        color: #0D7377;
    }

    /deep/ .display-container {
        z-index: 3;
    }

    .short-container {
        position: relative;

        .alert-clock {
            font-size: 12px;
            margin-top: 52px;
            float: right;
            margin-right: 20px;
            color: white;
            width: 98px;
            height: 32px;
            border-radius: 16px;
            border: 1px solid white;
            line-height: 32px;
            text-align: center;
        }

        .alert-result {
            clear: both;
            float: right;
            font-size: 12px;
            color: white;
            margin-right: 20px;
            margin-top: 10px;
            text-align: right;
        }

        .record {
            position: absolute;
            bottom: 104px;
            left: 50%;
            transform: translateX(-50%);

            .button {
                width: 140px;
                height: 140px;
                border: 1px solid white;
                border-radius: 50%;
                position: relative;
                background-color: white;
                text-align: center;
                line-height: 140px;
                color: #7F1DEF;
                margin-bottom: 26px;

                &::after {
                    height: 122px;
                    width: 122px;
                    border: 1px solid black;
                    border-radius: 50%;
                    position: absolute;
                    content: '';
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }

            .manual {
                width: fit-content;
                font-weight: bold;
                color: white;
                margin: 0 auto;
                padding-bottom: 2px;
                border-bottom: 1px solid white;
            }
        }
    }
}
</style>