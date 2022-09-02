<template>
    <view class="container">
        <nav-bar isBack="true" title="饮食日记"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <view class="info-container">
            <view class="search">
                <image class="search-image" src="../../../../static/icon/sub-package/search.png"></image>
                <input class="food-search" :value="inputValue" @focus="focusHandler" @input="inputHandler" />
            </view>
            <view class="list">
                <scroll-view scroll-y enable-flex class="directory-list" :style="{ height: scrollViewHeight + 'px' }">
                    <view v-if="directoryList.length">
                        <view :class="['directory-item', directoryActiveItem[i] ? 'active' : '']"
                            v-for="(v, i) in directoryList" :key="i" @click="changeContentList(i)">{{ v }}</view>
                    </view>
                </scroll-view>
                <scroll-view scroll-y enable-flex @scrolltolower="scrollToLowerHandler" class="content-list"
                    :style="{ height: scrollViewHeight + 'px' }">
                    <view v-if="contentList.length">
                        <view class="content-item" v-for="item in contentList" :key="item.id">
                            <view class="food-info">
                                <image :src="`${request.config.baseURL}/food/image/${item.id}`" class="food-image">
                                </image>
                                <view :class="['food-name', itemCount[item.id] > 0 ? 'name-active' : '']">{{ item.name
                                }}&nbsp;&nbsp;</view>
                                <view class="food-cal">
                                    <view class="cal">{{ item.heat }}cal /&nbsp;</view>
                                    <view class="unit">{{ item.unit }}</view>
                                </view>
                            </view>
                            <view class="count">
                                <view class="sub" @click="countChangeHandler(item.id, -1)">-</view>
                                <view class="number">{{ itemCount[item.id] || 0 }}</view>
                                <view class="add" @click="countChangeHandler(item.id, 1)">+</view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
            <view class="button">
                <view class="journal" @click="journalStatusChangeHandler">
                    <image src="../../../../static/icon/sub-package/journal.png" class="journal-image"></image>
                    <view :style="{ color: journalStatus === 2 ? '#0D7377' : 'gba(100, 100, 100, 0.5)' }">{{
                            journalStatus === 2 ? '取消日记' : journalStatus === 1 ? '继续日记' : '填写日记'
                    }}</view>
                </view>
                <view class="execute" @click="executeHandler">完成&nbsp;<text :style="{ opacity: '0.5' }">{{ foodTotalCount }}</text></view>
            </view>
        </view>
    </view>
</template>

<script setup>

import { useStore } from 'vuex'
import { computed, inject, reactive, ref, watch } from 'vue'
import showToast from '../../../../utils/showToast'
import request from '../../../../fly/index'
import HintMessage from '../../../../components/hint-message.vue'
import { onLoad } from '@dcloudio/uni-app'

async function executeHandler() {
    function addRecordToList() {
        const addItem = {
            id: setResult.message,
            food_id_set: idSet,
            date,
            time: dietTimeType,
            user_defined: null
        }

        const existItem = store.state.diet.todayRecordList
        let start = store.state.diet.start

        store.commit('diet/setTodayRecordList', [addItem, ...existItem])
        store.commit('diet/setStart', start + 1)
    }

    if (!foodTotalCount.value) {
        hintDisplay.value = Math.random()
        hintMessage.value = '尚未选择食物'
        return
    }

    let idSet = ''

    const itemCountObject = JSON.parse(JSON.stringify(itemCount))

    for (let i in itemCountObject) {
        if (itemCount[i] <= 0) continue

        idSet += `-${i},${itemCount[i]}`
    }

    idSet = idSet.substring(1)

    const date = store.state.diet.journalContent.time || new Date().getTime()

    const setResult = await $http.setDietRecord({
        date,
        time: dietTimeType,
        foodSet: idSet
    })

    if (setResult.status) return showToast('信息上传失败')

    if (store.state.diet.journalStatus === 0) {
        addRecordToList()
        showToast('添加成功')
        uni.navigateBack()
        return
    }

    const { time, text, option } = store.state.diet.journalContent

    const journalSetResult = await $http.setJournal({
        time,
        text,
        option,
        record: setResult.message
    })

    if (journalSetResult.status) return showToast('信息上传失败')

    addRecordToList()
    showToast('添加成功')
    uni.navigateBack()
}

function journalStatusChangeHandler() {
    if (journalStatus.value < 2) {
        store.commit('diet/setJournalStatus', 1)
        uni.navigateTo({
            url: '/sub-package/record/recipe/journal/journal'
        })
    } else {
        store.commit('diet/setJournalStatus', 1)
    }
}

function inputHandler(e) {
    if (!e.detail.value.trim()) return

    async function requestFunc(v) {
        const result = await $http.searchFood(v)

        if (result.status) return showToast()

        contentList.value = result.message
    }

    requestFunc(e.detail.value)
}

function focusHandler() {
    contentList.value = []
    directoryActiveItem.value[lastActiveItem] = 0
    inputValue.value = ''

    lastActiveItem = -1
}

function countChangeHandler(id, change) {
    if ((itemCount[id] || 0) + change < 0) return

    itemCount[id] = (itemCount[id] || 0) + change

    foodTotalCount.value = 0
    
    for (let i in itemCount) {
        foodTotalCount.value += Number(itemCount[i])
    }
}

function scrollToLowerHandler() {
    foodInfoRequest(contentList.value[0].sort)
}

function changeContentList(i) {
    inputValue.value = ' '

    if (lastActiveItem === -1) contentList.value = []

    if (i === lastActiveItem) return

    directoryActiveItem.value[lastActiveItem] = 0
    directoryActiveItem.value[i] = 1
    lastActiveItem = i

    start = 0
    length = 10

    foodInfoRequest(directoryList.value[i])
}

async function foodInfoRequest(sort) {
    const requestResult = await $http.getFoodInfo({
        start,
        length,
        sort
    })

    if (requestResult.status) return showToast()

    if (!requestResult.message.length) {
        hintDisplay.value = Math.random()
        hintMessage.value = `${contentList.value[0].sort}已加载完成`

        return
    }

    if (requestResult.message[0].sort === contentListTypeFlag) {
        contentList.value = [...contentList.value, ...requestResult.message]
    } else {
        contentList.value = requestResult.message
        contentListTypeFlag = requestResult.message[0].sort
    }

    if (!directoryList.value.length) {
        directoryList.value = requestResult.message[0].total_sort.split(',')

        for (let i = 0; i < directoryList.value.length; i++) {
            directoryActiveItem.value[i] = 0
        }

        directoryActiveItem.value[0] = 1
    }

    start += length

    if (contentList.value.length <= 10) length = 4

    if (Math.ceil(scrollViewHeight.value / 40) >= contentList.value.length) {
        foodInfoRequest(contentList.value[0].sort)
    }
}

const store = useStore()
const $http = inject('$http')
let start = 0, length = 10
const directoryList = ref([])
const directoryActiveItem = ref([])
const contentList = ref([])
let contentListTypeFlag = '五谷类'
const hintDisplay = ref('')
const hintMessage = ref('')
let scrollViewHeight = ref(0)
let lastActiveItem = 0
const itemCount = reactive({})
const inputValue = ref()
let dietTimeType = 0
const foodTotalCount = ref(0)

const journalStatus = computed(() => store.state.diet.journalStatus)

watch(() => store.state.system.availableHeight, (val) => {
    if (val < 0) return
    scrollViewHeight.value = val - 74 - 50

    foodInfoRequest('五谷类')
}, { immediate: true })

onLoad(option => {
    dietTimeType = Number(option.flag)
})

</script>

<style lang="less" scoped>
.container {
    .info-container {
        .search {
            width: 340px;
            height: 40px;
            background-color: #d7d7d7;
            border-radius: 17px;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;
            margin: 14px auto 20px;

            .search-image {
                width: 24px;
                height: 24px;
                display: block;

            }

            .food-search {
                font-size: 14px;
                line-height: 40%;
                margin-left: 10px;
                height: 100%;
                flex: 1;
                margin-right: 10px;
            }
        }

        .list {
            display: flex;

            .directory-list {
                width: 70px;
                border-right: 1px solid rgba(13, 115, 119, .2);

                .directory-item {
                    height: 40px;
                    line-height: 40px;
                    text-align: center;
                    font-size: 12px;
                    position: relative;

                    &:not(:last-child):after {
                        position: absolute;
                        left: 0;
                        height: 1px;
                        width: 50px;
                        bottom: 0;
                        background-color: rgba(200, 200, 200, .3);
                        content: '';
                    }
                }

                .active {
                    color: white;
                    background-color: #0D7377;
                }
            }

            .content-list {
                flex: 1;
                margin-left: 10px;

                .content-item {
                    display: flex;
                    height: 40px;
                    align-items: center;
                    border-bottom: 1px solid rgba(200, 200, 200, .3);

                    &:last-child {
                        border-bottom: none;
                    }

                    .food-info {
                        width: 200px;
                        display: flex;
                        align-items: center;

                        .food-image {
                            width: 24px;
                            height: 24px;
                            display: block;
                        }

                        .food-name {
                            font-size: 12px;
                            margin-left: 4px;
                        }

                        .name-active {
                            color: #0D7377;
                            font-weight: bold;
                        }

                        .food-cal {
                            display: flex;
                            font-size: 12px;
                            margin-left: 4px;
                            align-items: center;
                            opacity: .5;
                        }
                    }

                    .count {
                        display: flex;
                        width: 80px;
                        align-items: center;
                        height: 30px;
                        line-height: 30px;

                        .sub {
                            text-align: center;
                            flex: 1;
                            background-color: #f6f6f6;
                            height: 30px;
                        }

                        .number {
                            width: 30px;
                            height: 30px;
                            line-height: 30px;
                            text-align: center;
                            background-color: #eaeaea;
                        }

                        .add {
                            background-color: #f6f6f6;
                            text-align: center;
                            flex: 1;
                            height: 30px;
                        }
                    }
                }
            }
        }

        .button {
            height: 50px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: white;

            .journal {
                width: 100px;
                height: 30px;
                font-size: 14px;
                line-height: 30px;
                display: flex;
                align-items: center;
                text-indent: 10px;
                font-weight: bold;
                color: rgba(100, 100, 100, .5);

                .journal-image {
                    width: 30px;
                    height: 30px;
                    display: block;
                }
            }

            .execute {
                height: 40px;
                width: 120px;
                background-color: #0D7377;
                color: white;
                line-height: 40px;
                text-align: center;
                border-radius: 20px;
            }
        }
    }
}
</style>