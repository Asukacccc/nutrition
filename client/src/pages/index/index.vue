<template>
    <nav-bar isBack="false" title="首页"></nav-bar>
    <view class="search">
        <navigator url="/sub-package/home/search/search" class="search-navigator">
            <icon type="search" size="60rpx" color="green" class="search-navigator-icon"></icon>
            <text class="search-navigator-text">搜索食物营养和热量</text>
        </navigator>
    </view>
    <view class="function">
        <navigator class="function_food" url="/sub-package/home/classification/classification">
            <image class="function_food_image" :src="`${request.config.baseURL}/picture/get/food_details`"
                mode="aspectFit"></image>
            <text
                style="font-size: 30rpx; display: flex; justify-content: center; padding-top: 10rpx; font-weight: 400">食物分类</text>
        </navigator>
        <navigator class="function_answers" url="/sub-package/home/answer/answer">
            <image class="function_answer_image" :src="`${request.config.baseURL}/picture/get/answers`"
                mode="aspectFit"></image>
            <text
                style="font-size: 30rpx; display: flex; justify-content: center; padding-top: 10rpx; font-weight: 400;">问答</text>
        </navigator>
        <navigator class="function_evaluation" url="/sub-package/home/evaluation/evaluation">
            <image class="function_evaluation_image" :src="`${request.config.baseURL}/picture/get/evaluation`"
                mode="aspectFit"></image>
            <text
                style="font-size: 30rpx; display: flex; justify-content: center; padding-top: 10rpx; font-weight: 400">测评</text>
        </navigator>
    </view>
    <navigator class="news" :url="`/sub-package/home/information/information?id=${news_title.id}`">
        <text class="news_text_1">每日资讯</text>
        <text class="news_text_2">{{ news_title.title }}</text>
    </navigator>
    <view class="hotspot">
        <navigator class="hotspot_text" url="/sub-package/home/hot-spot/hot-spot?">
            <text class="hotspot_text_1">营养热点</text>
            <text class="hotspot_text_2">更多></text>
        </navigator>

        <navigator class="hotspot_article" :url="`/sub-package/home/information/information?id=${item.id}`" v-for="item in hotspot_list"
            :key="item.id">
            <image class="hotspot_article_image" :src="item.img"></image>
            <view class="hotspot_article_text">
                <text style="font-size: 32rpx">{{ item.hotspot_title }}</text>
                <text style="font-size: 20rpx; color: rgba( 0, 0, 0, 0.8)">【营养热点】第{{ item.order }}期</text>
            </view>
        </navigator>
    </view>
</template>

<script setup>

import { onLoad } from '@dcloudio/uni-app'
import request from '../../fly/index'
import { inject, reactive } from 'vue'
import showToast from '../../utils/showToast'

let news_title = reactive({ id: 1, title: "" })
let hotspot_list = reactive([
    { id: 1, img: `${request.config.baseURL}/picture/get/food_1`, hotspot_title: "", order: 1 },
    { id: 2, img: `${request.config.baseURL}/picture/get/food_2`, hotspot_title: "", order: 2 },
    { id: 3, img: `${request.config.baseURL}/picture/get/food_3`, hotspot_title: "", order: 3 }
])
const $http = inject('$http')

onLoad(async () => {
    const getResult = await $http.getArticleInfo()

    if (getResult.status) return showToast()

    news_title.id = getResult.message[0]._id
    news_title.title = getResult.message[0].title
    hotspot_list[0].id = getResult.message[0]._id
    hotspot_list[0].order = getResult.message[0].number
    hotspot_list[0].hotspot_title = getResult.message[0].title
    hotspot_list[1].id = getResult.message[1]._id
    hotspot_list[1].order = getResult.message[1].number
    hotspot_list[1].hotspot_title = getResult.message[1].title
    hotspot_list[2].id = getResult.message[2]._id
    hotspot_list[2].order = getResult.message[2].number
    hotspot_list[2].hotspot_title = getResult.message[2].title
})

</script>

<style lang="less">
.search {
    width: 80%;
    height: 75rpx;
    margin-left: 10%;
    margin-right: 10%;
    margin-top: 20rpx;
    background-color: #EBEBEB;
    border-radius: 30rpx;
}

.search-navigator {
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
    background-color: white;
    border-radius: 10px;
}

.search-navigator-icon {
    margin-top: 12rpx;
    margin-right: 20rpx;
    margin-left: 10rpx;
}

.search-navigator-text {
    margin-top: 12rpx;
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.4);
}

.function {
    height: 200rpx;
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.function_food {
    background-color: #F9F982;
    width: 20%;
    height: 130rpx;
    margin-top: 40rpx;
    margin-left: 6%;
    border-radius: 20rpx;
}

.function_food_image {
    width: 90%;
    height: 90%;
    padding-left: 5%;
    padding-top: 5%;
    display: flex;
}

.function_answers {
    background-color: #87F2FE;
    width: 20%;
    height: 130rpx;
    margin-top: 40rpx;
    margin-left: 10%;
    border-radius: 20rpx;
}

.function_answer_image {
    width: 90%;
    height: 90%;
    padding-left: 5%;
    padding-top: 5%;
    display: flex;
}

.function_evaluation {
    background-color: #9CFDB9;
    width: 20%;
    height: 130rpx;
    margin-top: 40rpx;
    margin-left: 10%;
    margin-right: 6%;
    border-radius: 20rpx;
}

.function_evaluation_image {
    width: 90%;
    height: 90%;
    padding-left: 5%;
    padding-top: 5%;
    display: flex;
}

.news {
    background-color: #97ECF6;
    margin-top: 40rpx;
    width: 90%;
    height: 250rpx;
    margin-left: 5%;
    margin-right: 5%;
    border-radius: 20rpx;
}

.news_text_1 {
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 20rpx;
    color: #585858;
    font-weight: 500;
    font-size: 28rpx;
}

.news_text_2 {
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 20rpx;
    font-size: 48rpx;
    font-weight: 600;
    letter-spacing: 4rpx;
}

.hotspot {
    background-color: #FFFFDC;
    margin-top: 40rpx;
    width: 90%;
    padding-bottom: 30rpx;
    margin-left: 5%;
    margin-right: 5%;
    padding-bottom: 50rpx;
    border-radius: 20rpx;
}

.hotspot_text {
    width: 90%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 5%;
    padding-right: 5%;
    padding-top: 20rpx;
}

.hotspot_text_1 {
    color: #585858;
    font-weight: 500;
    font-size: 28rpx;
}

.hotspot_text_2 {
    font-size: 28rpx;
    font-weight: 520;
    letter-spacing: 4rpx;
}

.hotspot_article {
    display: flex;
    flex-direction: row;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 40rpx;
}

.hotspot_article_image {
    height: 80rpx;
    width: 100rpx;
}

.hotspot_article_text {
    margin-left: 15rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
</style>