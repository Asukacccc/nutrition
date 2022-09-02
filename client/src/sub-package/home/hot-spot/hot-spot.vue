<template>
    <nav-bar isBack="true" title="热点资讯"></nav-bar>
    <view class="hotspot" v-for="(column, index) in hotspot" :key="index" @click="onclickHotspot(column._id)">
        <image :src="`${ request.config.baseURL }/picture/get/rice`"></image>
        <view class="hotspot_text">
            <text style="font-size: 32rpx;">{{ column.more_title }}</text>
            <text style="font-size: 24rpx; font-weight: 300; margin-top: 10rpx;">【营养热点】第{{ column.number }}期</text>
        </view>
    </view>
</template>

<script setup>

import { inject, reactive } from 'vue'
import request from '../../../fly/index'
import showToast from '../../../utils/showToast'

function onclickHotspot(id) {
    uni.navigateTo({
        url: `/sub-package/home/information/information?id=${id}`
    })
}

const $http = inject('$http')
const hotspot = reactive([])

async function requestArticle() {
    const requestResult = await $http.getArticleInfo()

    if (requestResult.status) return showToast()

    hotspot.push(...requestResult.message)
}

requestArticle()

</script>

<style lang="less" scoped>
.hotspot {
    height: 160rpx;
    border-bottom: 1px rgba(112, 112, 112, 0.4) solid;
    display: flex;
    flex-direction: row;
}

.hotspot image {
    margin-top: 30rpx;
    margin-left: 8%;
    margin-right: 30rpx;
    width: 120rpx;
    height: 100rpx;
}

.hotspot_text {
    display: flex;
    flex-direction: column;
    margin-top: 30rpx;
    
}
</style>