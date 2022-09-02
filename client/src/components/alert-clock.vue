<template>
    <view :class="['container', display ? '' : 'hidden']">
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <view class="choose-container" :style="{ top: top + 'px' }">
            <view @click="closeHandler">
                <image src="../../static/icon/component/close.png" class="close-icon" mode="widthFix"></image>
            </view>
            <view class="caption">闹铃相关</view>
            <view class="start-time">
                <view class="brief">当前时间</view>
                <view class="specific">
                    <view class="date">{{ `${startArray[0]}-${startArray[1]}-${startArray[2]}` }}</view>
                    <view class="time">{{ `${startArray[3]} : ${startArray[4]}` }}</view>
                </view>
            </view>
            <view class="end-time">
                <view class="brief">结束时间</view>
                <view class="specific">
                    <view class="date">
                        <picker mode="date" header-text="结束日期选择" @change="changeDateTime($event, true)">
                            <text>{{ `${endArray[0]}-${endArray[1]}-${endArray[2]}` }}</text>
                        </picker>
                    </view>
                    <view class="time">
                        <picker mode="time" header-text="结束时间选择" @change="changeDateTime($event, false)">
                            <text>{{ `${endArray[3]} : ${endArray[4]}` }}</text>
                        </picker>
                    </view>
                </view>
            </view>
            <view class="choose-audio">
                <view class="brief">从微信聊天中选取音频文件</view>
                <view class="specific" @click="chooseAudio">{{ audioName }}</view>
            </view>
            <view class="confirm" @click="confirmHandler">确认</view>
            <view class="tips">点击--处选择日期时间, 点击音频文件可重选</view>
        </view>
    </view>
</template>

<script setup>

import { ref, computed, reactive, watch, useAttrs } from 'vue'
import { useStore } from 'vuex'
import showToast from '../utils/showToast';
import ShallowBackground from './shallow-background.vue'

function closeHandler() {
    emit('closeAlertClockSet')
}

function confirmHandler() {
    if (endArray[3].indexOf('-') !== -1) {
        showToast('结束时间为空')
        return
    }

    startArray[1] -= 1
    endArray[1] -= 1

    const startTime = new Date(...startArray).getTime()
    const endTime = new Date(...endArray).getTime()

    startArray[1] += 1
    endArray[1] += 1

    if (startTime >= endTime) {
        showToast('时间先后关系错误')
        return
    }

    if (!Reflect.ownKeys(store.state.sleep.alertClockAudio).length) {
        showToast('尚未设置闹铃声')
        return
    }

    store.commit('sleep/setAlertClockTime', JSON.parse(JSON.stringify(endArray)))

    emit('confirmAlertClockSet')
}

function chooseAudio() {
    uni.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['m4a', 'wav', 'mp3', 'aac', 'aiff', 'caf'],
        success(chooseResult) {
            audioName.value = chooseResult.tempFiles[0].name

            store.commit('sleep/setAlertClockAudio', chooseResult.tempFiles[0])
        },
        fail() {
            showToast('获取失败')
        }
    })
}

function changeDateTime(e, flag) {
    const value = e.detail.value

    if (flag) {
        endArray.splice(0, 3, ...value.split('-'))
        endArray[1] /= 1
    } else {
        endArray.splice(3, 2, ...value.split(':'))
    }
}

async function getLiveTime() {
    function execute(flag = true) {
        const time = new Date()

        const year = time.getFullYear()
        const month = time.getMonth() + 1
        const date = time.getDate()
        const hours = time.getHours()
        const minutes = time.getMinutes()

        startArray.splice(0, 5, ...[year, month, date, hours > 9 ? hours : '0' + hours, minutes > 9 ? minutes : '0' + minutes])

        if (!flag) return [time.getSeconds(), year, month, date]
    }

    const timeResult = execute(false)

    endArray.splice(0, 3, timeResult[1], timeResult[2], timeResult[3])

    await new Promise(resolve => {
        setTimeout(() => {
            execute()
            resolve()
        }, (60 - timeResult[0]) * 1000)
    })

    return execute
}

const backgroundDisplay = ref('')
const store = useStore()
const startArray = reactive(['----', '--', '--', '--', '--'])
const endArray = reactive(['----', '--', '--', '--', '--'])
const attrs = useAttrs()
const display = ref(false)
let timer
const audioName = ref('未选')
const emit = defineEmits(['confirmAlertClockSet', 'closeAlertClockSet'])

const top = computed(() => store.state.system.screenHeight / 2)

watch(() => attrs.display, async val => {
    if (!val) {
        backgroundDisplay.value = ''
        display.value = false
        clearInterval(timer)
        endArray[3] = '--'
        endArray[4] = '--'
        audioName.value = '未选'

        return
    }

    display.value = true
    backgroundDisplay.value = 'true'

    const func = await getLiveTime()

    timer = setInterval(func, 60 * 1000)
})

</script>

<style lang="less" scoped>
.container {
    .choose-container {
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

        .start-time,
        .end-time,
        .choose-audio {
            margin-bottom: 28px;

            .brief {
                font-size: 14px;
            }

            .specific {
                margin-top: 10px;
                text-indent: 10px;
                font-size: 12px;
                display: flex;
                font-weight: bold;
            }

            .date {
                opacity: 0.7;
                font-weight: normal;
            }
        }

        .choose-audio .specific {
            height: 20px;
            padding: 0 4px;
            background-color: #0D7377;
            color: white;
            line-height: 20px;
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
            margin-top: 46px;
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