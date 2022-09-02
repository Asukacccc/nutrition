<template>
    <nav-bar isBack="true" title="食物搜索"></nav-bar>
    <scroll-view scroll-y :style="{ height: scrollViewHeight + 'px' }">
        <view class="search">
            <view class="search_bar">
                <icon type="search" size="60rpx" color="green"></icon>
                <input maxlength="10" type="text" placeholder="搜索食物营养和热量" @input="search" />
            </view>
            <text class="search_text" @click="back">取消</text>
        </view>

        <view class="search_result">
            <view class="search_result_text">
                <text>搜索结果</text>
            </view>
            <view class="food_list" v-if="isInput" v-for="(item, i) in food_list" :key="i">
                <view class="food_details" @click="onclickFood(item)" :id="item.id">
                    <image class="food_details_image" :src="`${request.config.baseURL}/picture/get/food_1`"></image>
                    <view class="food_details_text">
                        <text class="food_details_text_1" style="font-size: 30rpx; font-weight: 600;">{{ item.name
                        }}</text>
                        <text class="food_details_text_2" style="font-size: 25rpx;">{{ item.energy }}千卡/100克</text>
                    </view>
                </view>
            </view>
        </view>
    </scroll-view>
</template>
<script setup>

import { reactive, inject, ref, computed } from 'vue'
import request from '../../../fly/index'
import showToast from '../../../utils/showToast'
import { useStore } from 'vuex'

const food_list = reactive([])
let isInput = ref(false)
let is_input = false
let keyWord = ""
let searchList = []
let rice = `${request.config.baseURL}/picture/get/rice`
const $http = inject('$http')

const store = useStore()

const scrollViewHeight = computed(() => store.state.system.availableHeight)

function back() {
    uni.navigateBack()
}

function onclickFood({ name, protein, sugars, fat }) {
    uni.navigateTo({

        url: `/sub-package/home/food-detail/food-detail?name=${name}&protein=${protein}&sugars=${sugars}&fat=${fat}`
    })
}

function search(e) {

    const value = e.detail.value

    async function requestFunc(v) {
        const result = await $http.getSearchResultByQa(v)

        if (result.status) return showToast()

        food_list.push(...result.message)
    }

    if (e.detail.value.trim()) requestFunc(value)

    if (value == "") {
        is_input = false
    } else if (value != "") {
        is_input = true
    }
    isInput.value = is_input

}

</script>
<style lang="less" scoped>
.search {
    height: 120rpx;
    display: flex;
    flex-direction: row;
}

.search_bar {
    width: 75%;
    height: 65rpx;
    margin-top: 30rpx;
    margin-left: 5%;
    border-radius: 30rpx;
    background-color: #EBEBEB;
    display: flex;
    align-items: center;
    margin-right: 20rpx;
}

.search_text {
    margin-top: 40rpx;
    font-size: 35rpx;
}

.search_result {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.search_result_text {
    height: 72rpx;
    background-color: #EBEBEB;
    align-items: center;
    display: flex;
    padding-left: 30rpx;
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