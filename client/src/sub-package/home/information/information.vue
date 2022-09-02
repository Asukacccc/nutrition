<template>
    <nav-bar isBack="true" title="文章信息"></nav-bar>
    <scroll-view scroll-y :style="{ height: scrollViewHeight + 'px' }">
        <view class="title">
            <text style="margin-top: 40rpx; margin-left: 40rpx;font-size: 36rpx; color: white;">{{ s_title }}</text>
            <view class="title_text">
                <text style="font-size: 56rpx;display: flex;padding-top: 20rpx;padding-left: 5%;padding-right: 5%;
                padding-bottom: 20rpx;font-weight: bold;">{{
                        l_title
                }}</text>
            </view>
        </view>

        <view class="content_1">
            <text>{{ knowledge }}</text>
        </view>

        <view class="content_2">
            <view class="content_2_label">
                <text>知识拓展</text>
            </view>
            <view class="content_2_expand">
                <text style="font-weight: bold; font-size: 30rpx; line-height: 55rpx;">{{ exp_knowledge_title }}</text>
                <text :style="{ whiteSpace: 'pre-wrap' }">{{ exp_knowledge_content }}</text>
            </view>
        </view>

        <view class="collection" @click="collection">
            <image
                :src="isCollection == true ? `${request.config.baseURL}/picture/get/collected` : `${request.config.baseURL}/picture/get/collection`"
                mode="aspectFit"></image>
        </view>
    </scroll-view>

</template>

<script setup>

import { onLoad } from '@dcloudio/uni-app'
import { computed, inject, ref } from 'vue'
import showToast from '../../../utils/showToast'
import request from '../../../fly/index'
import { useStore } from 'vuex'

function collection() {
    isCollection.value = !isCollection.value
}

const $http = inject('$http')
const s_title = ref('营养热点')
const l_title = ref('')
const knowledge = ref('')
const exp_knowledge_title = ref('')
const exp_knowledge_content = ref('')
const isCollection = ref('')
const store = useStore()

const scrollViewHeight = computed(() => store.state.system.availableHeight)

onLoad(async option => {
    const requestResult = await $http.getArticleContent({ _id: option.id })

    if (requestResult.status) return showToast()

    const item = requestResult.message[0]

    const a = item.more

    l_title.value = item.title.replace(/\\n/g, '\n')
    knowledge.value = item.content.replace(/\\n/g, '\n')
    exp_knowledge_title.value = item.more_title.replace(/\\n/g, '\n')
    exp_knowledge_content.value = item.more.replace(/\\n/g, '\n')
})

</script>

<style lang="less" scoped>
page {
    background-color: #CFFDF9;
}

.title {
    width: 90%;
    height: 420rpx;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 30rpx;
    background-color: #4DB3EE;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
}

.title_text {
    width: 80%;
    height: 240rpx;
    background-color: white;
    margin-top: 30rpx;
    margin-left: 10%;
    margin-right: 10%;
    border-radius: 20rpx;
    margin-bottom: 132rpx;
}

.content_1 {
    width: 90%;
    background-color: white;
    margin-top: 50rpx;
    margin-left: 5%;
    margin-right: 5%;
    border-radius: 20rpx;
    display: flex;
}

.content_1 text {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 30rpx;
    margin-bottom: 30rpx;
    font-size: 30rpx;
    letter-spacing: 3rpx;
    line-height: 50rpx;
}

.content_2 {
    width: 90%;
    background-color: white;
    margin-top: 50rpx;
    margin-left: 5%;
    margin-right: 5%;
    margin-bottom: 50rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
}

.content_2_label {
    width: 25%;
    background-color: #4DB3EE;
    color: white;
    padding-left: 5%;
    padding-right: 5%;
    padding-top: 15rpx;
    padding-bottom: 15rpx;
    text-align: center;
    border-radius: 20rpx 0 20rpx 0;
    letter-spacing: 6rpx;
}

.content_2_expand {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 30rpx;
    margin-bottom: 50rpx;
    font-size: 30rpx;
    line-height: 55rpx;
    display: flex;
    flex-direction: column;
}

.collection {
    width: 100%;
    height: 90rpx;
    background-color: white;
    display: flex;
    justify-content: center;
}

.collection image {
    height: 90%;
    margin-top: 5rpx;
}
</style>