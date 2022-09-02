<template>
    <nav-bar isBack="true" title="评测时刻"></nav-bar>
    <view class="progress_bar">
        <progress :percent="progress_percentV" border-radius="20rpx" stroke-width="10rpx" activeColor="#10AEFF"
            backgroundColor="#EBEBEB" active="true" duration='0' active-mode='forwards'>
        </progress>
    </view>

    <view class="question">
        <text>{{ textV }}</text>
    </view>

    <view class="answer">
        <block v-for="(item, index) in option" :key="index">
            <view :class="currentIndex == index ? 'selectedAnswer_items' : 'answer_items'" :id="index"
                :data-grade="item.grade" :data-percent="progress_percentV" @click="selectedOption">
                <text>{{ item.content }}</text>
                <view :style="{
                    height: '40rpx', width: '40rpx', borderRadius: '50%',
                    backgroundColor: `${currentIndex == index ? '#00F5FF' : 'white'}`, marginRight: '45rpx'
                }">
                </view>
            </view>
        </block>
    </view>

    <view v-if="number == 11" class="state">
        <text>得分：{{ gradeV }}</text>
        <text v-if="gradeV < 50" style="color: red;">{{ state[2].content }}</text>
        <text v-if="gradeV >= 50 && gradeV < 80" style="color: orange;">{{ state[1].content }}</text>
        <text v-if="gradeV >= 80" style="color: springgreen;">{{ state[0].content }}</text>
    </view>
</template>
<script setup>

import { ref, reactive, inject } from 'vue'
import showToast from '../../../utils/showToast';

function change(e) {
    var num = number.value + 1
    var text = problem['title_' + num]


    textV.value = text
    currentIndex.value = -1
    number.value = num
    progress_percentV.value = e
}

function selectedOption(e) {
    var grade = e.currentTarget.dataset.grade
    var totol_grade = gradeV.value + grade
    var progress_percent = progress_percentV.value + 10

    currentIndex.value = e.currentTarget.id
    gradeV.value = totol_grade
    setTimeout(change, 300, progress_percent);
}

const problem = reactive({
    id: 0, title_1: '', title_2: '', title_3: '', title_4: '',
    title_5: '', title_6: '', title_7: '', title_8: '', title_9: '', title_10: ''
})
const textV = ref('')
const option = reactive([
    { id: 1, content: "没有", grade: 0 },
    { id: 2, content: "有时有", grade: 6 },
    { id: 3, content: "一直都是", grade: 10 },
])
const state = reactive([
    { id: 1, content: "身体不错，继续保持" },
    { id: 2, content: "轻度健康问题，日常生活需注意" },
    { id: 3, content: "中度亚健康状态，黄色预警启动" }
])

const gradeV = ref(0)
const number = ref(1)
const progress_percentV = ref(0)
const currentIndex = ref(-1)
const $http = inject('$http')

async function request() {
    const requestResult = await $http.getEvaluation()

    if (requestResult.status) return showToast()
    
    problem.id = requestResult.message._id
    problem.title_1 = requestResult.message.title_1
    problem.title_2 = requestResult.message.title_2
    problem.title_3 = requestResult.message.title_3
    problem.title_4 = requestResult.message.title_4
    problem.title_5 = requestResult.message.title_5
    problem.title_6 = requestResult.message.title_6
    problem.title_7 = requestResult.message.title_7
    problem.title_8 = requestResult.message.title_8
    problem.title_9 = requestResult.message.title_9
    problem.title_10 = requestResult.message.title_10
    textV.value = requestResult.message.title_1
}

request()

</script>
<style lang="less" scoped>
/* pages/evaluation/evaluation.wxss */
.progress_bar {
    width: 90%;
    margin-top: 40rpx;
    margin-left: 5%;
    margin-right: 5%;
}

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

.answer_items text {
    margin-left: 5%;
    margin-top: 20rpx;
    margin-bottom: 20rpx;
    font-size: 34rpx;
    letter-spacing: 4rpx;
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

.state {
    margin-left: 5%;
    margin-right: 5%;
    font-size: 40rpx;
}

.state text {
    display: block;
    text-align: center;
    margin-top: 50rpx;
}
</style>