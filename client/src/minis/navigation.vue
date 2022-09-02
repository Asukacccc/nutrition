<template>
    <view class="container">
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
        <view class="navigation-bar" :style="{ height: navigatorBarHeight + 'px' }">
            <uni-icons :color="whiteFlag ? 'white' : 'black'" type="arrowleft" :class="['icon', { hide: isBack === 'false' }]" size="18" @click="backBefore">
            </uni-icons>
            <view class="title">
                <text>- {{ title }} -</text>
            </view>
            <view :class="['align', { hide: isBack === 'false' }]"></view>
        </view>
    </view>
    <view class="position-occupy" :style="{ height: navigatorBarHeight + statusBarHeight + 'px' }"></view>
</template>
<script setup>
import { useAttrs, ref } from 'vue'
import { useStore } from 'vuex'
import { onReady } from '@dcloudio/uni-app'

function backBefore() {
    uni.navigateBack()
}

function navigatorHeight(winHeight) {
    const { top, height } = uni.getMenuButtonBoundingClientRect()
    navigatorBarHeight.value = (top - statusBarHeight + 2) * 2 + height

    store.commit('system/setAvailableHeight', winHeight - navigatorBarHeight.value - statusBarHeight)
    store.commit('system/setNavigationHeight', navigatorBarHeight.value)
}

function statusHeight() {
    const res = uni.getSystemInfoSync()
    statusBarHeight = res.statusBarHeight

    store.commit('system/setStatusHeight', res.statusBarHeight)
    store.commit('system/setScreenHeight', res.screenHeight)
    store.commit('system/setScreenWidth', res.screenWidth)
    navigatorHeight(res.screenHeight)
}

const store = useStore()
const { title, isBack, whiteFlag } = useAttrs()
let statusBarHeight
const navigatorBarHeight = ref()

onReady(() => {
    statusHeight()
})

</script>

<style lang="less" scoped>
.container {
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 4;
    box-shadow: 0 0px 1px 1px rgba(0, 0, 0, .1);

    .status-bar {
        background-color: #fafafa;
    }

    .navigation-bar {
        background-color: #fafafa;
        font-weight: bold;
        color: #0d7377;
        font-size: 16px;
        display: flex;
        box-sizing: content-box;
        align-items: center;
        padding: 0 16px;
        justify-content: space-between;

        .icon {
            justify-self: left;
        }

        .align {
            width: 18px;
        }

        .hide {
            pointer-events: none;
            opacity: 0;
        }
    }
}
</style>