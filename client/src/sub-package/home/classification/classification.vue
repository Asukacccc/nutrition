<template>
    <nav-bar isBack="true" title="食物分类"></nav-bar>
    <scroll-view scroll-y :style="{ height: scrollViewHeight + 'px' }">
        <view class="navigation">
            <block v-for="(item, index) in title" :key="index">
                <text :class="currentIndex == index ? 'selected' : 'normal'" :id="index" @click="navigateText">{{ item
                }}</text>
            </block>
        </view>

        <view class="food_list" v-for="(item, index) in food_list" :key="index">
            <view class="food_details" @click="onclickFood" :data-id="item.id" :data-protein="item.protein"
                :data-sugars="item.sugars" :data-fat="item.fat" :data-name="item.name">
                <image class="food_details_image" :src="`${request.config.baseURL}/picture/get/rice`"
                    mode="aspectFill"></image>
                <view class="food_details_text">
                    <text class="food_details_text_1" style="font-size: 30rpx; font-weight: 600;">{{ item.name }}</text>
                    <text class="food_details_text_2" style="font-size: 25rpx;">{{ item.energy }}千卡/100克</text>
                </view>
            </view>
        </view>
    </scroll-view>
</template>

<script setup>

import { ref, reactive, inject, computed } from 'vue'
import showToast from '../../../utils/showToast'
import request from '../../../fly/index'
import { useStore } from 'vuex'

async function navigateText(e) {
    food_list.length = 0

    if (e) currentIndex.value = e.currentTarget.id

    const requestResult = await $http.getClassificationResultByQa({ id: currentIndex.value })

    if (requestResult.status) return showToast()

    food_list.push(...requestResult.message)
}

function onclickFood(e) {
    const sugars = e.currentTarget.dataset.sugars
    const protein = e.currentTarget.dataset.protein
    const fat = e.currentTarget.dataset.fat
    const name = e.currentTarget.dataset.name

    wx.navigateTo({
        url: `/sub-package/home/food-detail/food-detail?name=${name}&protein=${protein}&sugars=${sugars}&fat=${fat}`
    })
}

const food_list = reactive([])
const title = ['常用', '主食', '肉类', '蔬菜', '水果', '饮料']
const currentIndex = ref(0)
const $http = inject('$http')
const store = useStore()

const scrollViewHeight = computed(() => store.state.system.availableHeight)

navigateText()

</script>

<style lang="less" scoped>
.navigation {
    height: 80rpx;
    border-top: 1rpx rgba(112, 112, 112, 0.4) solid;
    border-bottom: 1rpx rgba(112, 112, 112, 0.4) solid;
    padding-left: 5%;
    padding-right: 5%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    line-height: 80rpx;
}

.normal {
    color: black;
}

.selected {
    color: #00B8A9;
}

.food_list {
    display: flex;
    flex-direction: column;
}

.food_details {
    height: 140rpx;
    width: 90%;
    margin-top: 40rpx;
    margin-left: 5%;
    margin-right: 5%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px rgba(112, 112, 112, 0.4) solid;
}

.food_details_image {
    height: 100rpx;
    width: 100rpx;
    border-radius: 20rpx;
    margin-right: 20rpx;
}

.food_details_text {
    width: 500rpx;
    line-height: 100rpx;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>