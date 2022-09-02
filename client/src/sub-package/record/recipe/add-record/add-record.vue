<template>
    <view class="container">
        <nav-bar isBack="true" title="饮食日记"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <scroll-view scroll-y class="add-container" :style="{ height: scrollViewHeight + 'px' }">
            <view class="calories" @click="analyzeHandler"
                :style="{ backgroundImage: `url(${request.config.baseURL}/picture/get/analyze)` }">
                <view class="top-text">今天已吃</view>
                <view class="bottom-text">
                    <text class="number">{{ totalCalories }}</text>
                    <text>&nbsp;</text>
                    <text class="unit">cal</text>
                </view>
            </view>
            <view class="diet-type">
                <view class="breakfast item" @click="addRecord(0)">
                    <image class="item-image" src="../../../../static/icon/sub-package/breakfast.png"></image>
                    <view class="text">+ 早餐</view>
                </view>
                <view class="lunch item" @click="addRecord(1)">
                    <image class="item-image" src="../../../../static/icon/sub-package/lunch.png"></image>
                    <view class="text">+ 午餐</view>
                </view>
                <view class="dinner item" @click="addRecord(2)">
                    <image class="item-image" src="../../../../static/icon/sub-package/dinner.png"></image>
                    <view class="text">+ 晚餐</view>
                </view>
                <view class="snack item" @click="addRecord(3)">
                    <image class="item-image" src="../../../../static/icon/sub-package/snack.png"></image>
                    <view class="text">+ 加餐</view>
                </view>
            </view>
            <view class="diet-list">
                <view class="diet-item" v-for="item in dietList" :key="item.id">
                    <view class="total">
                        <view class="total-type">{{ dietNameHandler(item.time) }}</view>
                        <view class="total-cal">{{ itemTotalCalories[item.id] || 0 }} <text
                                :style="{ opacity: '0.3' }">cal</text></view>
                    </view>
                    <view class="specific-list" v-if="foodInfoObj[item.id]">
                        <view class="specific-item" v-for="(val, key, i) in foodInfoObj[item.id]" :key="key">
                            <view class="specific-name">{{ val.name }}</view>
                            <view class="specific-cal">{{ val.heat * foodArray[item.id][i].split(',')[1] }}
                                <text :style="{ opacity: '0.5', fontSize: '12px' }"> {{ unitHandler(val.unit,
                                        foodArray[item.id][i].split(',')[1])
                                }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { computed, inject, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import showToast from '../../../../utils/showToast'
import HintMessage from '../../../../components/hint-message.vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import request from '../../../../fly/index'

function analyzeHandler() {
    store.commit('diet/setFoodInfo', JSON.parse(JSON.stringify(foodInfoObj)))

    uni.navigateTo({
        url: '/sub-package/record/recipe/analyze/analyze'
    })
}

async function loadMore() {
    const requestResult = await $http.getDietRecord({
        start,
        length: 4,
        boundary: store.state.diet.todayTime,
        today: 1
    })

    if (requestResult.status) return showToast()

    if (!requestResult.message.length) {
        hintDisplay.value = Math.random()
        hintMessage.value = '数据加载完毕'

        dietList.value.push.apply(dietList.value, requestResult.message)
        getFoodInfo(dietList.value)
        return
    } else {
        start += 4
        loadMore()
    }
}

function addRecord(flag) {
    uni.navigateTo({
        url: '/sub-package/record/recipe/choose/choose?flag=' + flag
    })
}

function unitHandler(text, count) {
    const back = text.match(/(?<=\d+\/?\d?)[^g\d]/)[0]
    const forward = text.match(/\d+\/?\d*(?=\D+)/)[0]

    return Number(forward) * count + back
}

async function getFoodInfo(list) {
    for (let i of list) {
        await foodInfoHandler(i)

        itemTotalCalories[i.id] = 0

        let position = 0

        for (let key in foodInfoObj[i.id]) {
            itemTotalCalories[i.id] += Number(foodInfoObj[i.id][key].heat) * Number(foodArray[i.id][position++].split(',')[1])
        }
    }

    totalCalories.value = itemTotalCalories.reduce((total, item) => total += item, 0)
}

function dietNameHandler(itemId) {
    switch (itemId) {
        case 0: return '早餐'
        case 1: return '午餐'
        case 2: return '晚餐'
        case 3: return '加餐'
    }
}

function foodInfoHandler(item) {
    return new Promise(resolve => {
        function getPromise(id) {
            return new Promise(async (resolve, reject) => {
                const result = await $http.getSingleFoodInfo({ id })

                if (result.state) return reject(result.message)

                resolve(result.message)
            })
        }

        foodArray[item.id] = item.food_id_set.split('-')
        let promiseArray = []

        for (let i of foodArray[item.id]) {
            promiseArray.push(getPromise(Number(i.split(',')[0])))
        }

        Promise.all(promiseArray).then(v => {
            foodInfoObj[item.id] = {}

            for (let i of v) {
                foodInfoObj[item.id][i.id] = i
            }

            resolve()
        }).catch(() => {
            showToast()
        })
    })
}

const store = useStore()
const totalCalories = ref(0)
const foodInfoObj = reactive({})
const $http = inject('$http')
const itemTotalCalories = reactive([])
const hintDisplay = ref('')
const hintMessage = ref()
const foodArray = {}
let originPageHide = false

const scrollViewHeight = computed(() => store.state.system.availableHeight)
const dietList = computed(() => store.state.diet.todayRecordList)
let start = 0

onUnload(() => {
    store.commit('diet/setStart', start)
    store.commit('diet/setTodayRecordList', JSON.parse(JSON.stringify(dietList.value)))
})

onHide(() => {
    originPageHide = true
})

onShow(() => {
    start = store.state.diet.start
    if (!originPageHide) loadMore()
    getFoodInfo(dietList.value)
})

</script>

<style lang="less" scoped>
.container {
    .add-container {
        .calories {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            width: 330px;
            height: 150px;
            border-radius: 10px;
            margin: 14px auto 24px;
            box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
            position: relative;
            background-color: white;
            background-position: 50% 8%;
            color: white;

            &::after {
                content: '点击查看营养分析';
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 12px;
                opacity: .7;
            }

            .top-text {
                font-size: 12px;
                margin-bottom: 10px;
            }

            .bottom-text {
                vertical-align: bottom;

                .number {
                    font-size: 20px;
                    color: #0D7377;
                    font-weight: bold;
                }

                .unit {
                    font-size: 12px;
                }
            }
        }

        .active {
            background-color: #0D7377;
            color: white;
        }

        .diet-type {
            margin: 0 auto;
            display: flex;
            width: 350px;
            justify-content: space-between;
            background-color: white;
            padding: 10px;
            border-radius: 10px;
            box-sizing: border-box;

            .item {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                background-color: white;
                width: 60px;
                height: 60px;

                .item-image {
                    width: 40px;
                    height: 40px;
                }

                .text {
                    margin-top: 4px;
                    font-size: 14px;
                    opacity: .5;
                }
            }
        }

        .diet-list {
            margin: 20px auto;

            .diet-item {
                margin: 10px auto;
                width: 340px;
                padding: 10px 16px;
                box-sizing: border-box;
                background-color: #fafafa;
                border-radius: 10px;

                .total {
                    font-size: 16px;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    position: relative;

                    &::after {
                        position: absolute;
                        content: '';
                        height: 2px;
                        width: 500px;
                        background-color: gray;
                        opacity: .15;
                        bottom: -10px;
                        left: 50%;
                        transform: translateX(-50%) scale(0.5);
                    }

                    .total-type,
                    .total-cal {
                        font-weight: bold;
                    }
                }

                .specific-list {
                    .specific-item {
                        margin: 8px auto;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 14px;
                    }
                }
            }
        }
    }
}
</style>