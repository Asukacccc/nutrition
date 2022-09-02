<template>
    <view class="container" :style="{ overflow: display ? 'visible' : 'hidden' }">
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <view :class="['box-container', display ? 'active' : '']" :style="{ height: height + 'px' }">
            <view class="content">
                <view class="top">{{ topTitle }}</view>
                <view class="middle">{{ middleTitle }}</view>
                <view class="button">
                    <view class="cancel" @click="confirmResult(false)">取消</view>
                    <view class="confirm" @click="confirmResult(true)">确认</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>

import { useAttrs, computed, ref } from 'vue'
import shallowBackground from './shallow-background.vue'
import { useStore } from 'vuex'

function confirmResult(result) {
    emit('deleteResult', result)
}

const attrs = useAttrs()
const store = useStore()
const height = store.state.system.availableHeight
let display = true
const backgroundDisplay = ref(false)
const emit = defineEmits(['deleteResult'])

let topTitle = computed(() => attrs.topTitle)
let middleTitle = computed(() => attrs.middleTitle)

display = computed(() => {
    backgroundDisplay.value = attrs.display
    return attrs.display === 'true'
})

</script>

<style lang="less" scoped>
.container {
    position: relative;
    z-index: 3;
    .box-container {
        position: absolute;
        width: 100vw;
        opacity: 0;
        pointer-events: none;

        .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 250px;
            height: 150px;
            background-color: white;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
            padding: 16px 0;
            font-size: 16px;
            flex-direction: column;

            .top,
            .middle,
            .button {
                text-align: center;
            }

            .top {
                color: #939191;
            }

            .middle {
                color: #000000;
            }

            .button {
                width: 100%;
                display: flex;
                justify-content: space-between;

                .confirm {
                    color: #D72323;
                }

                .cancel {
                    color: #000000;
                }

                .confirm, .cancel {
                    width: 50%;
                    text-align: center;
                    position: relative;
                    &:hover {
                        &::after {
                            content: '';
                            position: absolute;
                            top: 50%; left: 50%;
                            transform: translate(-50%, -50%);
                            background-color: gray;
                            opacity: .2;
                            width: 100px;
                            height: 40px;
                            z-index: -1;
                            border-radius: 8px;
                        }
                    }
                }
            }
        }
    }

    .active {
        opacity: 1;
        pointer-events: auto;
    }
}
</style>