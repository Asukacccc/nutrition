<template>
    <view :class="['container', display ? '' : 'hidden']">
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <hint-message :display="hintDisplay" :message="hintMessage" v-if="!hiddenTopBarHint"></hint-message>
        <view class="display-container" :style="{ top: top + 'px', '--font-color': isRespite ? '#6639a6' : 'black' }">
            <view @click="closeHandler">
                <image src="../../static/icon/component/close.png" class="close-icon" mode="widthFix"></image>
            </view>
            <view class="caption">{{ isRespite ? '短期休憩记录' : '夜间睡眠记录'}}</view>
            <view class="sleep-type">
                <view class="brief">睡眠类型</view>
                <view class="specific">{{ isRespite ? '短期休憩' : '夜间睡眠' }}</view>
            </view>
            <view class="start-time">
                <view class="brief">开始时间</view>
                <view class="specific">
                    <view class="date">
                        <picker mode="date" header-text="开始日期选择" @change="changeDateTime($event, 0)">
                            <text>{{ `${startArray[0]}-${startArray[1]}-${startArray[2]}` }}</text>
                        </picker>
                    </view>
                    <view class="time">
                        <picker mode="time" header-text="开始时间选择" @change="changeDateTime($event, 1)">
                            <text>{{ `${startArray[3]} : ${startArray[4]}` }}</text>
                        </picker>
                    </view>
                </view>
            </view>
            <view class="end-time">
                <view class="brief">结束时间</view>
                <view class="specific">
                    <view class="date">
                        <picker mode="date" header-text="结束日期选择" @change="changeDateTime($event, 2)">
                            <text>{{ `${endArray[0]}-${endArray[1]}-${endArray[2]}` }}</text>
                        </picker>
                    </view>
                    <view class="time">
                        <picker mode="time" header-text="结束时间选择" @change="changeDateTime($event, 3)">
                            <text>{{ `${endArray[3]} : ${endArray[4]}` }}</text>
                        </picker>
                    </view>
                </view>
            </view>
            <view class="confirm" @click="confirmHandler">确认</view>
            <view class="tips">点击对应位置设置日期和时间</view>
        </view>
    </view>
</template>
<script setup>

import ShallowBackground from './shallow-background.vue'
import { ref, useAttrs, watch, computed, reactive, inject } from 'vue'
import { useStore } from 'vuex'
import HintMessage from './hint-message.vue'
import showToast from '../utils/showToast'

function closeHandler() {
    emit('closeRecord')
}

async function confirmHandler() {
    if (startArray[3].indexOf('-') !== -1) {
        if (hiddenTopBarHint.value) {
            showToast('开始时间尚未输入')
        } else {
            hintDisplay.value = Math.random()
            hintMessage.value = '开始时间尚未输入'
        }
        return
    }

    if (endArray[3].indexOf('-') !== -1) {
        if (hiddenTopBarHint.value) {
            showToast('结束时间尚未输入')
        } else {
            hintDisplay.value = Math.random()
            hintMessage.value = '结束时间尚未输入'
        }
        return
    }

    startArray[1] -= 1
    endArray[1] -= 1

    const startTime = new Date(...startArray).getTime()
    const endTime = new Date(...endArray).getTime()

    startArray[1] += 1
    endArray[1] += 1

    if (startTime >= endTime) {
        if (hiddenTopBarHint.value) {
            showToast('开始时间点不可大于或等于结束点')
        } else {
            hintDisplay.value = Math.random()
            hintMessage.value = '开始时间点不可大于或等于结束点'
        }
        return
    }

    if (endTime > new Date().getTime()) {
        if (hiddenTopBarHint.value) {
            showToast('结束时间点大于现在')
        } else {
            hintDisplay.value = Math.random()
            hintMessage.value = '结束时间点大于现在'
        }
        return
    }

    const setResult = await $http.setSleepRecord({
        respite: Number(isRespite.value),
        sleepInterval: `${startTime},${endTime}`
    })

    if (setResult.status) return showToast('记录失败')

    emit('confirmRecord', isRespite.value, `${startTime},${endTime}`, Number(setResult.message))
}

function changeDateTime(e, flag) {
    const value = e.detail.value

    switch (flag) {
        case 0: {
            startArray.splice(0, 3, ...value.split('-'))
            startArray[1] /= 1
            break
        }
        case 1: {
            startArray.splice(3, 2, ...value.split(':'))
            break
        }
        case 2: {
            endArray.splice(0, 3, ...value.split('-'))
            endArray[1] /= 1
            break
        }
        case 3: {
            endArray.splice(3, 2, ...value.split(':'))
            break
        }
    }
}

function getYesterday(year, month, day) {
    const monthArray = ['31', '', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31']
    let tempYear = year, tempMonth = month, tempDate = day

    const leapYear = !(year % 400) || !(year % 4) && year % 100

    monthArray[1] = leapYear ? '29' : '28'

    tempDate -= 1

    if (!tempDate) {
        tempMonth -= 1
        tempDate = monthArray[tempMonth - 1] - 0

        if (!(tempMonth - 1)) {
            tempYear -= 1
            tempMonth = 12
            tempDate = 31
        }
    }

    return [tempYear, tempMonth, tempDate]
}

function getTimeInfo(time) {
    const date = new Date(time)

    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return [year, month + 1, day, hours, minutes]
}

const backgroundDisplay = ref('')
const attrs = useAttrs()
const display = ref(false)
const isRespite = ref(0)
const store = useStore()
const top = computed(() => {
    if (hiddenTopBarHint.value) {
        return store.state.system.screenHeight / 2
    } else {
        return store.state.system.availableHeight / 2 + store.state.system.navigationHeight + store.state.system.statusHeight
    }
})
const emit = defineEmits(['closeRecord', 'confirmRecord'])
const startArray = reactive(['----', '--', '--', '--', '--'])
const endArray = reactive(['----', '--', '--', '--', '--'])
const hintDisplay = ref()
const hintMessage = ref()
const $http = inject('$http')
const hiddenTopBarHint = ref()

watch(() => attrs.display, val => {
    if (!val) {
        backgroundDisplay.value = ''
        display.value = false
        startArray[3] = '--'
        startArray[4] = '--'
        endArray[3] = '--'
        endArray[4] = '--'

        return
    }

    display.value = true
    backgroundDisplay.value = 'true'
    hiddenTopBarHint.value = attrs.transparentBar

    isRespite.value = Number(attrs.respite)
});

(function () {
    const currentTime = new Date()

    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const day = currentTime.getDate()

    startArray.splice(0, 3, ...getYesterday(year, month, day))

    endArray[0] = year
    endArray[1] = month
    endArray[2] = day
})()

</script>
<style lang="less" scoped>
.container {
    .display-container {
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 16px 22px 40px;
        width: 350px;
        height: 400px;
        box-sizing: border-box;
        background-color: white;

        .caption {
            font-size: 16px;
            text-align: center;
            margin-bottom: 16px;
            color: #0D7377;
            position: relative;

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

        .close-icon {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 20px;
            z-index: 2;
        }

        .sleep-type,
        .start-time,
        .end-time {
            margin-bottom: 28px;

            .brief {
                font-size: 14px;
            }

            .specific {
                margin-top: 10px;
                text-indent: 10px;
                font-size: 12px;
                color: var(--font-color);
                display: flex;
                font-weight: bold;
            }

            .date {
                opacity: 0.7;
                font-weight: normal;
            }
        }

        .confirm {
            width: 80px;
            font-size: 14px;
            height: 30px;
            border-radius: 20px;
            line-height: 30px;
            text-align: center;
            background-color: #0D7377;
            color: white;
            float: right;
            margin-top: 50px;
        }

        .tips {
            clear: both;
            font-size: 10px;
            color: gray;
            opacity: .5;
            float: right;
            margin-top: 10px;
        }
    }

}


.hidden {
    opacity: 0;
    pointer-events: none;
}
</style>