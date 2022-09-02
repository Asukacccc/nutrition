<template>
    <nav-bar isBack="true" title="问答时刻"></nav-bar>
    <view class="question">
        <text>{{ problem }}</text>
    </view>
    <view class="answer">
        <block v-for="(v, i) in option" :key="i">
            <view :class="currentIndex == i ? 'selectedAnswer_items' : 'answer_items'"
                @click="selectedOption(i)">
                <text>{{ v.content }}</text>
                <text v-if="answer == v.id && currentIndex == i"
                    style="color: aquamarine; font-weight: 600;">正确</text>
                <view
                    style="height:40rpx; width:40rpx; border-radius: 50%; background-color: {{currentIndex == i? '#00F5FF' : 'white'}}; margin-right: 45rpx;">
                </view>
            </view>
        </block>
    </view>

</template>
<script setup>

import { ref, reactive, inject } from 'vue'
import showToast from '../../../utils/showToast'

function selectedOption(i) {
    currentIndex.value = i
}

const problem = ref("")
const option = reactive([
    { id: 0, content: "" },
    { id: 1, content: "" },
    { id: 2, content: "" },
])
const answer = ref(0)
const currentIndex = ref(-1)
const $http = inject('$http')


async function request() {
    const requestResult = await $http.getAnswerInfo()

    if (requestResult.status) return showToast()

    problem.value = requestResult.message.title
    
    option[0].content = requestResult.message.option1
    option[1].content = requestResult.message.option2
    option[2].content = requestResult.message.option3

    answer.value = requestResult.message.answer
}

request()

</script>

<style lang="less" scoped>
.question {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    margin-top: 30rpx;
    margin-bottom: 50rpx;
    font-size: 50rpx;
}

.answer {
    width: 90%;
    margin-left: 5%;
    margin-right: 5%;
    display: flex;
    flex-direction: column;

}

.answer_items {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-radius: 20rpx;
    background-color: #C5C5C5;
    align-items: center;
    margin-bottom: 40rpx;
}

.selectedAnswer_items {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-radius: 20rpx;
    background-color: #919191;
    align-items: center;
    margin-bottom: 40rpx;
}

.selectedAnswer_items text {
    margin-left: 5%;
    margin-top: 20rpx;
    margin-bottom: 20rpx;
    font-size: 34rpx;
    letter-spacing: 4rpx;
}

.answer_items text {
    margin-left: 5%;
    margin-top: 20rpx;
    margin-bottom: 20rpx;
    font-size: 34rpx;
    letter-spacing: 4rpx;
}
</style>