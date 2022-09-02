<template>
    <view class="container" :style="{ backgroundImage: `url(${request.config.baseURL}/picture/get/sleep)` }">
        <nav-bar :isBack="true" title="小憩中" :whiteFlag="true" class="nav-bar"></nav-bar>
        <view class="sleep-container">
            <view class="content">
                <view class="currentTime">{{ currentTime }}</view>
                <view class="alert-clock" v-if="hasAlertClock">
                    <view class="time" v-if="!playingFlag">闹钟响于 <text :style="{ fontWeight: 'normal' }">{{ timeHandler(alertTime) }}</text></view>
                    <view class="time" v-else>闹铃在响...</view>
                    <view class="closeempty" @click="closeAlertClock"></view>
                </view>
            </view>
            <view class="close-sleep" @click="closeSleep">结束小憩</view>
        </view>
    </view>
</template>
<script setup>

import request from '../../../../fly/index'
import { useStore } from 'vuex'
import { ref, computed } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import timeHandler from '../../../../utils/sleepTimeFormat'
import showToast from '../../../../utils/showToast'

function closeSleep() {
    uni.navigateBack()
}

function alertAudio(current, origin = false) {
    if (!hasAlertClock.value) return

    if (origin) {
        if (current >= alertTimeSeconds) {
            closeAlertClock()
            return showToast('闹铃时间已过')
        }
    } else {
        if (current >= alertTimeSeconds) {
            audio.src = audioInfo.path
            audio.play()
            playingFlag.value = true
        }
    }
}

function closeAlertClock() {
    store.commit('sleep/clearRespiteInfo')
}

async function getLiveTime() {
    function execute(origin = false) {
        const date = new Date()
        const hours = date.getHours()
        const minutes = date.getMinutes()

        currentTime.value = `${ hours > 9 ? hours : '0' + hours }:${ minutes > 9 ? minutes : '0' + minutes }`

        alertAudio(date.getTime())

        if (origin) return date.getSeconds()
    }

    const seconds = execute(true)

    await new Promise(resolve => {
        setTimeout(() => {
            execute()
            resolve()
        }, (60 - seconds) * 1000)
    })

    return execute
}

const store = useStore()
let timer
const hasAlertClock = computed(() => {
    const status = store.state.sleep.hasSetAlertClock
    if (!status) audio.stop()

    return status
})
const audioInfo = store.state.sleep.alertClockAudio
const alertTime = store.state.sleep.alertClockTime
const startTime = Date.now()
const currentTime = ref()
const audio = uni.createInnerAudioContext({ useWebAudioImplement: true })
const playingFlag = ref(false)

const alertTimeSeconds = (function(){
    if (!hasAlertClock.value) return ''

    const temp = [...alertTime]

    temp[1] -= 1
    return new Date(...temp).getTime()
})()

alertAudio(startTime, true);

(async function() {
    const intervalFunc = await getLiveTime()
    timer = setInterval(intervalFunc, 60 * 1000)
})()

onUnload(() => {
    audio.stop()
    clearInterval(timer)
    store.commit('sleep/setRespiteCloseTime', Date.now())
    store.commit('sleep/setRespiteStartTime', startTime)
})

</script>
<style lang="less" scoped>
.container {
    height: 100%;
    width: 100%;
    background-size: cover;
    position: relative;

    .nav-bar /deep/ .status-bar,
    .nav-bar /deep/ .navigation-bar {
        background-color: transparent;
    }

    .nav-bar /deep/ .container {
        box-shadow: none;
    }

    .sleep-container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 340px;
        height: 50%;
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        .content {
            .currentTime {
                font-size: 40px;
                font-weight: bold;
                text-align: center;
            }

            .alert-clock {
                display: flex;
                margin-top: 16px;
                font-size: 12px;
                font-weight: lighter;
                align-items: center;
                justify-content: center;

                .closeempty {
                    position: relative;
                    height: 12px;
                    width: 12px;
                    transform: rotate(45deg);

                    &::before {
                        height: 34px;
                        width: 2px;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0.5);
                    }

                    &::after {
                        height: 2px;
                        width: 34px;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0.5);
                    }

                    &::after,
                    &::before {
                        content: '';
                        background-color: white;
                        position: absolute;
                    }
                }

                .time {
                    margin-right: 10px;
                }
            }
        }

        .close-sleep {
            color: white;
            width: 98px;
            height: 32px;
            border-radius: 16px;
            border: 1px solid white;
            line-height: 32px;
            text-align: center;
            font-size: 12px;
            opacity: 0.7;
        }
    }
}
</style>