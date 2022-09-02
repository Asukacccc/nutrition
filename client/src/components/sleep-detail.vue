<template>
    <view :class="['container', display ? '' : 'hidden']">
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <view class="display-container" :style="{ top: top + 'px', '--font-color': isRespite ? '#6639a6' : 'black' }">
            <view @click="closeHandler">
                <image src="../../static/icon/component/close.png" class="close-icon" mode="widthFix"></image>
            </view>
            <view class="caption">睡眠详情</view>
            <view class="sleep-type">
                <view class="brief">睡眠类型</view>
                <view class="specific">{{ isRespite ? '短期休憩' : '夜间睡眠' }}</view>
            </view>
            <view class="start-time">
                <view class="brief">开始时间</view>
                <view class="specific">
                    <view class="date">{{ `${startArray[0]}-${startArray[1]}-${startArray[2]}` }}</view>
                    <view class="time">{{ `${padZero(startArray[3])} : ${padZero(startArray[4])}` }}</view>
                </view>
            </view>
            <view class="end-time">
                <view class="brief">结束时间</view>
                <view class="specific">
                    <view class="date">{{ `${endArray[0]}-${endArray[1]}-${endArray[2]}` }}</view>
                    <view class="time">{{ `${padZero(endArray[3])} : ${padZero(endArray[4])}` }}</view>
                </view>
            </view>
        </view>
    </view>
</template>
<script setup>

import ShallowBackground from './shallow-background.vue'
import { ref, useAttrs, watch, reactive, computed } from 'vue'
import { useStore } from 'vuex'

function padZero(v) {
    return v > 9 ? v : '0' + v
}

function closeHandler() {
    emit('closeDisplay')
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
const startArray = reactive([])
const endArray = reactive([])
const display = ref(false)
const isRespite = ref(0)
const store = useStore()
const top = computed(() => store.state.system.availableHeight / 2 + store.state.system.navigationHeight + store.state.system.statusHeight)
const emit = defineEmits(['closeDisplay'])

watch(() => attrs.display, val => {
    if (!val) {
        backgroundDisplay.value = ''
        display.value = false
        startArray.length = 0
        endArray.length = 0

        return
    }

    display.value = true
    backgroundDisplay.value = 'true'

    startArray.push(...getTimeInfo(Number(attrs.interval.split(',')[0])))
    endArray.push(...getTimeInfo(Number(attrs.interval.split(',')[1])))
    isRespite.value = Number(attrs.respite)
})

</script>
<style lang="less" scoped>
.container {
    .display-container {
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 16px 22px 40px;
        width: 300px;
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
    }

}


.hidden {
    opacity: 0;
    pointer-events: none;
}
</style>