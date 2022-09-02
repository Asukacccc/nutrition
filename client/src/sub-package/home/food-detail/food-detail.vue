<template>
    <nav-bar isBack="true" title="食物信息"></nav-bar>
    <view class="food_details">
        <image class="food_details_image" :src="`${ request.config.baseURL }/picture/get/rice`"></image>
        <text class="food_details_text">{{ name }}</text>
    </view>

    <view class="food_card">
        <view class="food_card_headline">
            <text style="font-size: 40rpx;">营养成分</text>
            <text style="font-size: 25rpx;">每100g可食部</text>
        </view>

        <view class="food_card_subtitle">
            <text>营养元素</text>
            <text style="margin-right: 8%;">含量</text>
        </view>

        <view class="food_card_value" v-for="(value, key) in food" :key="key">
            <text>{{ key }}</text>
            <text style="text-align: right; padding-right: 45rpx;">{{ value }}克</text>
        </view>

    </view>
</template>

<script setup>

import request from '../../../fly/index'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

const food = reactive({})
const name = ref('')

onLoad((options) => {

    name.value = options.name
    food['蛋白质'] = options.protein
    food['脂肪'] = options.fat
    food['碳水化合物'] = options['sugars']

})

</script>

<style scoped lang="less">
.food_details {
    height: 190rpx;
    width: 100%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px rgba(112, 112, 112, 0.4) solid;
    background-color: white;
}

.food_details_image {
    height: 130rpx;
    width: 130rpx;
    border-radius: 20rpx;
    margin-top: 30rpx;
    margin-left: 5%;
    margin-right: 30rpx;
}

.food_details_text {
    font-size: 46rpx;
    margin-top: 58rpx;
    letter-spacing: 3rpx;
}

.food_card {
    background-color: white;
    height: 700rpx;
    width: 90%;
    margin-top: 40rpx;
    margin-left: 5%;
    margin-right: 5%;
    border-radius: 12rpx;

}

.food_card_headline {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 20rpx;
    margin-bottom: 35rpx;
    align-items: center;
}

.food_card_subtitle {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 5%;
    margin-right: 5%;
    font-size: 34rpx;
    padding-bottom: 40rpx;
    border-bottom: 1px rgba(112, 112, 112, 0.4) solid;
}

.food_card_value {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 20rpx;
    font-size: 32rpx;
    align-items: center;
    padding-bottom: 20rpx;
    margin-bottom: 40rpx;
    border-bottom: 1rpx rgba(112, 112, 112, 0.4) solid;
}

.food_card_value text {
    width: 30%;
}
</style>