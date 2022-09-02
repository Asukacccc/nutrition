<template>
    <view class="container">
        <nav-bar isBack="true" title="饮食日记"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <scroll-view scroll-y @scrolltolower="scrollToLowerHandler" :style="{ height: `${scrollViewHeight}px` }"
            class="record-container">
            <uni-calendar :insert="true" :endDate="`${year}-${month + 1}-${day}`" :date="`${year}-${month + 1}-${day}`"
                :startDate="`${year}-${month + 1}-${day}`">
            </uni-calendar>
            <view class="button-list">
                <view class="button">
                    <view class="record" @click="pageChange">记录与分析</view>
                    <view class="shift">
                        <view @click="changePart('today')" :class="['today', todayModuleActive ? 'active' : '']">当天记录
                        </view>
                        <view @click="changePart('past')" :class="['past', !todayModuleActive ? 'active' : '']">过去记录
                        </view>
                    </view>
                </view>
                <view class="today-past">
                    <view class="not" v-if="!recipeRecordList.length">{{ todayModuleActive ? '今天暂无记录' : '过去无记录' }}
                    </view>
                    <view class="list" v-else>
                        <view class="item" v-for="item in recipeRecordList" :key="item.id" :data-id="item.id"
                            @click="detailPage">
                            <view class="info">
                                <image class="diet-image" :src="dietImageHandler(item.time)">
                                </image>
                                <view class="diet-name">{{ dietNameHandler(item.time) }}</view>
                                <view class="time">{{ dietTimeHandler(item.date) }}</view>
                            </view>
                            <view class="date" v-show="!todayModuleActive">{{ timeFormat(item.date) }}</view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { useStore } from 'vuex'
import UniCalendar from '@dcloudio/uni-ui/lib/uni-calendar/uni-calendar.vue'
import { computed, inject, reactive, ref } from 'vue'
import showToast from '../../../../utils/showToast'
import timeFormat from '../../../../utils/time'
import HintMessage from '../../../../components/hint-message.vue'
import { onHide, onShow } from '@dcloudio/uni-app'

function detailPage(e) {
    uni.navigateTo({
        url: '/sub-package/record/recipe/detail/detail?id=' + e.currentTarget.dataset.id
    })
}

function pageChange() {
    uni.navigateTo({
        url: '/sub-package/record/recipe/add-record/add-record'
    })
}

function changePart(flag) {
    if (flag === 'past' && !todayModuleActive.value) return
    if (flag === 'today' && todayModuleActive.value) return

    const tempArray = listRecord

    todayModuleActive.value = !todayModuleActive.value

    listRecord = JSON.parse(JSON.stringify(recipeRecordList))
    recipeRecordList.length = 0

    recipeRecordList.push.apply(recipeRecordList, tempArray)
}

function getTime() {
    const today = new Date()

    year = today.getFullYear()
    month = today.getMonth()
    day = today.getDate()

    return new Date(year, month, day).getTime()
}

function scrollToLowerHandler() {
    if (todayModuleActive.value) {
        requestRecipe({
            start,
            length,
            boundary: todayOriginTime,
            today: 1,
        })

        start += length
    } else {
        requestRecipe({
            start: pastStart,
            length: pastLength,
            boundary: todayOriginTime,
            today: 0
        })

        pastStart += pastLength
    }
}

function dietTimeHandler(date) {
    const dateFormat = new Date(Number(date))

    return `${dateFormat.getHours()} : ${dateFormat.getMinutes()}`
}

function dietNameHandler(itemId) {
    switch (itemId) {
        case 0: return '早餐'
        case 1: return '午餐'
        case 2: return '晚餐'
        case 3: return '加餐'
    }
}

function dietImageHandler(timeId) {
    let dietName = ''

    switch (timeId) {
        case 0: {
            dietName = 'breakfast'
            break
        }
        case 1: {
            dietName = 'lunch'
            break
        }
        case 2: {
            dietName = 'dinner'
            break
        }
        case 3: {
            dietName = 'snack'
            break
        }
    }

    return `../../../../static/icon/sub-package/${dietName}.png`
}

async function requestRecipe(info, push = true, array = recipeRecordList) {
    const requestResult = await $http.getDietRecord(info)

    if (requestResult.status) return showToast()

    if (!requestResult.message.length) {
        hintDisplay.value = Math.random()
        hintMessage.value = '数据加载完毕'
        return
    }

    if (push) {
        requestResult.message.forEach(v => {
            array.push(v)
        })
    } else {
        requestResult.message.forEach(v => {
            array.unshift(v)
        })
    }
}

const store = useStore()
let start = 0, length = 10
let pastStart = 0, pastLength = 10
const $http = inject('$http')
const recipeRecordList = reactive([])
const hintDisplay = ref('')
const hintMessage = ref()
let todayOriginTime = getTime()
const todayModuleActive = ref(true)
let listRecord = []
let year, month, day
let pageShowOrigin = true

const scrollViewHeight = computed(() => store.state.system.availableHeight)

function originExecute() {
    requestRecipe({
        start,
        length,
        boundary: todayOriginTime,
        today: 1,
    })

    start += length
    length = 4

    requestRecipe({
        start: pastStart,
        length: pastLength,
        boundary: todayOriginTime,
        today: 0
    }, true, listRecord)

    pastStart += pastLength
    pastLength = 4
}

originExecute()

onHide(() => {
    if (todayModuleActive.value) {
        store.commit('diet/setTodayRecordList', JSON.parse(JSON.stringify(recipeRecordList)))
    } else {
        store.commit('diet/setTodayRecordList', JSON.parse(JSON.stringify(listRecord)))
    }

    store.commit('diet/setStart', start)
    store.commit('diet/setTodayTime', todayOriginTime)

    pageShowOrigin = false
})

onShow(() => {
    if (pageShowOrigin) return

    const currentTime = getTime()

    if (currentTime !== todayOriginTime) {
        start = 0
        length = 0
        pastStart = 0
        pastLength = 0
        recipeRecordList.length = 0
        todayOriginTime = getTime()
        listRecord = []
        year = 0
        month = 0
        day = 0

        originExecute()
        return
    }

    if (todayModuleActive.value) {
        recipeRecordList.length = 0
        recipeRecordList.push.apply(recipeRecordList, store.state.diet.todayRecordList)
        start = store.state.diet.start
    } else {
        listRecord = store.state.diet.todayRecordList
        pastStart = store.state.diet.start
    }
})

</script>

<style lang="less" scoped>
.container {
    /deep/ .uni-calendar__backtoday,
    /deep/ .uni-calendar__header-btn-box {
        pointer-events: none;
        opacity: 0;
    }

    .record-container {
        .button-list {
            .button {
                .record {
                    width: 134px;
                    height: 48px;
                    border-radius: 24px;
                    color: white;
                    background-color: #0D7377;
                    line-height: 48px;
                    text-align: center;
                    margin: 14px auto 20px;
                    font-size: 20px;
                }

                .shift {
                    margin-left: 32px;
                    display: flex;

                    .today,
                    .past {
                        height: 30px;
                        width: 100px;
                        line-height: 30px;
                        text-align: center;
                        background-color: white;
                        font-size: 14px;
                        color: gray;
                        border-radius: 4px;
                    }

                    .past {
                        margin-left: 18px;
                    }

                    .active {
                        color: #0D7377;
                        font-weight: bold;
                    }
                }
            }

            .today-past {
                .not {
                    width: calc(100% - 32 * 2px);
                    height: 40px;
                    line-height: 40px;
                    border-radius: 10px;
                    color: #8C8C8C;
                    background-color: #E6E6E6;
                    margin: 20px auto 14px;
                    text-align: center;
                }

                .list {
                    .item {
                        font-size: 12px;
                        width: calc(100% - 32 * 2px);
                        margin: 16px auto 14px;
                        box-sizing: border-box;
                        padding: 0 16px;
                        box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
                        background-color: white;
                        height: 40px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        .info {
                            width: max-content;
                            display: flex;
                            align-items: center;
                            height: 40px;

                            .diet-image {
                                width: 22px;
                                height: 22px;
                                display: block;
                            }

                            .diet-name {
                                margin-left: 14px;
                            }

                            .time {
                                margin-left: 14px;
                            }
                        }

                        .date {
                            margin-left: 16px;
                            flex: 1;
                            overflow: hidden;
                            width: 0;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            opacity: 0.5;
                            text-align: right;
                        }
                    }
                }
            }
        }
    }
}
</style>