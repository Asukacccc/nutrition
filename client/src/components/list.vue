<template>
    <view class="container">
        <confirm-box :display="confirmBoxDisplay" :topTitle="topTitle" :middleTitle="middleTitle"
            @deleteResult="deleteResult"></confirm-box>
        <hint-message :message="message" :display="display"></hint-message>
        <item-detail :scanItem="scanItem" :detailDisplay="detailDisplay" @closeDetailContainer="closeDetailContainer">
        </item-detail>
        <view class="scroll">
            <scroll-view scroll-y refresher-enabled enable-flex :refresher-triggered="refreshTrigger" :scroll-with-animation="true"
                @scrolltolower="scrollToLowerHandler" @refresherrefresh="refreshHandler" class="music-container"
                :style="{ height: scrollHeight + 'px' }" :scroll-top="scrollTop + 'px'" @scroll="scrollHandler">
                <view :style="{ height: '14px', width: '10px', flexShrink: '0' }" class="spaceOccupy"></view>
                <not-content v-if="!(musicListHeight - defaultAddHeight)" :leftMove="marginLeft + 'px'"></not-content>
                <not-content v-if="!(recipeListHeight - defaultAddHeight)" :leftMove="marginLeft + screenWidth + 'px'">
                </not-content>
                <view class="shift" @click="shiftItemHandler">
                    <view :class="['music', musicItemActive ? 'active' : '']">助眠曲</view>
                    <view class="middle">|</view>
                    <view :class="['recipe', musicItemActive ? '' : 'active']">食谱</view>
                </view>
                <view class="music-recipe" @touchstart="touchStartHandler" @touchmove="touchMoveHandler"
                    @touchend="touchEndHandler"
                    :style="{ height: totalContainerHeight + 'px', transition: isDeleting ? '0.2s' : '0' }">
                    <view class="music-list" :style="{ marginLeft: marginLeft + 'px' }">
                        <view v-if="releaseItemDisplay">
                            <view :class="['item', musicItemIdObj[item.id] ? 'deleteExecute' : '']"
                                v-for="item in sleepMusicList" :key="item.id">
                                <release-item :item="item" @itemClick="showDetail(item.id)"
                                    @deleteHandler="deleteHandler" @notFunction="not">
                                </release-item>
                            </view>
                        </view>
                        <view v-else>
                            <view :class="['item', musicItemIdObj[item.id] ? 'deleteExecute' : '']"
                                v-for="item in sleepMusicList" :key="item.id">
                                <fond-item :item="item" @itemClick="showDetail(item.id)" @deleteHandler="deleteHandler"
                                    @notFunction="not">
                                </fond-item>
                            </view>
                        </view>
                    </view>
                    <view class="recipe-list">
                        <view v-if="releaseItemDisplay">
                            <view :class="['item', recipeItemIdObj[item.id] ? 'deleteExecute' : '']"
                                v-for="item in recipeList" :key="item.id">
                                <release-item :item="item" @itemClick="showDetail(item.id)"
                                    @deleteHandler="deleteHandler" @notFunction="not">
                                </release-item>
                            </view>
                        </view>
                        <view v-else>
                            <view :class="['item', recipeItemIdObj[item.id] ? 'deleteExecute' : '']"
                                v-for="item in recipeList" :key="item.id">
                                <fond-item :item="item" @itemClick="showDetail(item.id)" @deleteHandler="deleteHandler"
                                    @notFunction="not">
                                </fond-item>
                            </view>
                        </view>
                    </view>
                </view>
                <view :style="{ height: '50px', width: '10px' }"></view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>

import { inject, ref, computed, watch, useAttrs } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ReleaseItem from './release-item.vue'
import FondItem from './fond-item.vue'
import { useStore } from 'vuex'
import ConfirmBox from './confirm-box.vue'
import HintMessage from './hint-message.vue'
import ItemDetail from './item-detail.vue'
import NotContent from './not-content.vue'
import showToast from '../utils/showToast.js'
import { nextTick } from 'process'

function not() { }

function showDetail(id) {
    detailDisplay.value = true
    if (musicItemActive.value) {
        scanItem.value = sleepMusicList.value.find(v => v.id === id)
    } else {
        scanItem.value = recipeList.value.find(v => v.id === id)
    }
}

function closeDetailContainer() {
    detailDisplay.value = false
}

function getListLiveHeight(isSleepMusic = true) {
    if (!isSleepMusic) {
        const array = recipeList.value.filter(item => recipeItemIdObj.value[item.id] !== 1)
        recipeListHeight.value = array.length * (90 + 12) + defaultAddHeight
    } else {
        const array = sleepMusicList.value.filter(item => musicItemIdObj.value[item.id] !== 1)
        musicListHeight.value = array.length * (90 + 12) + defaultAddHeight
    }
}

function scrollHandler(e) {
    currentScrollTop = e.detail.scrollTop
}

function manageShiftScrollTop(record) {
    nextTick(() => {
        setTimeout(() => {
            scrollTop.value = anotherScrollTopRecord - Math.random()
            anotherScrollTopRecord = record
        }, 200)
    })
}

function shiftItemHandler() {
    musicItemActive.value = !musicItemActive.value
    marginLeft.value = marginLeft.value ? 0 : screenWidth.value * -1
}

function touchStartHandler(e) {
    originMarginLeft = marginLeft.value
    originPageX = e.touches[0].pageX
}

function touchMoveHandler(e) {
    const spaceX = e.touches[0].pageX - originPageX

    if (originMarginLeft + spaceX < screenWidth.value * -1) return
    if (originMarginLeft + spaceX > 0) return
    if (Math.abs(spaceX) < 30) return

    marginLeft.value = originMarginLeft + spaceX
}

function touchEndHandler() {
    if (marginLeft.value >= screenWidth.value / -2) {
        marginLeft.value = 0
        musicItemActive.value = true
    } else {
        marginLeft.value = screenWidth.value * -1
        musicItemActive.value = false
    }
}

async function deleteResult(val) {
    confirmBoxDisplay.value = 'false'

    if (val) {
        if (musicItemActive.value) {
            const res = releaseItemDisplay.value ? await $http.deleteSleepMusicItem(prepDeleteId) : await $http.cancelMusicConfirm(prepDeleteId)

            if (!res.status) {
                musicItemIdObj.value[prepDeleteId] = 1
                getListLiveHeight(true)

                showToast('删除成功')
            } else {
                uni.showToast({
                    title: "删除失败",
                    icon: 'none'
                })
            }
        }
        else {
            const res = releaseItemDisplay.value ? await $http.deleteRecipeItem(prepDeleteId) : await $http.cancelRecipeConfirm(prepDeleteId)

            if (!res.status) {
                recipeItemIdObj.value[prepDeleteId] = 1
                getListLiveHeight(false)
            } else {
                uni.showToast({
                    title: "删除失败",
                    icon: 'none'
                })
            }
        }
        isDeleting.value = true

        setTimeout(() => {
            isDeleting.value = false
        }, 200)
    }
}

function deleteHandler(id) {
    if (releaseItemDisplay.value) {
        topTitle.value = `是否确认删除${musicItemActive.value ? '助眠曲' : '食谱'}`
    } else {
        topTitle.value = `是否取消认可${musicItemActive.value ? '助眠曲' : '食谱'}`
    }

    const item = musicItemActive.value ? sleepMusicList.value.find(x => x.id === id) : recipeList.value.find(x => x.id === id)

    middleTitle.value = musicItemActive.value ? item.title + ' - ' + item.singer : item.title
    confirmBoxDisplay.value = 'true'
    prepDeleteId = item.id
}

async function getSleepMusic(info, unshift = false) {
    if (musicTotalDataLoadDone) {
        display.value = String(Math.random())
        message.value = '助眠曲已加载完毕'
        setTimeout(() => refreshTrigger.value = false, 0)
        return
    }

    const musicResult = releaseItemDisplay.value ? await $http.getSleepMusic(info) : await $http.getSleepMusicByIdArr(info)

    if (musicResult.status) return

    refreshTrigger.value = false

    if (!musicResult.message.length) {
        musicTotalDataLoadDone = true
        display.value = String(Math.random())
        message.value = '助眠曲已加载完毕'
        return
    }

    if (!unshift) {
        sleepMusicList.value = [...sleepMusicList.value, ...musicResult.message]
    } else {
        sleepMusicList.value = [...musicResult.message, ...sleepMusicList.value]
    }

    musicResult.message.map(mapItem => {
        musicItemIdObj.value[mapItem.id] = 0
    })

    getListLiveHeight(true)
}

async function getDietRecipe(info, unshift = false) {
    if (recipeTotalDataLoadDone) {
        display.value = String(Math.random())
        message.value = '食谱已加载完毕'
        setTimeout(() => refreshTrigger.value = false, 100)
        return
    }

    const recipeResult = releaseItemDisplay.value ? await $http.getDietRecipe(info) : await $http.getDietRecipeByIdArr(info)

    if (recipeResult.status) return

    if (!recipeResult.message.length) {
        recipeTotalDataLoadDone = true
        display.value = String(Math.random())
        message.value = '食谱已加载完毕'
        return
    }

    if (!unshift) {
        recipeList.value = [...recipeList.value, ...recipeResult.message]
    } else {
        recipeList.value = [...recipeResult.message, ...recipeList.value]
    }

    recipeResult.message.map(mapItem => {
        recipeItemIdObj.value[mapItem.id] = 0
    })

    getListLiveHeight(false)
}

function sleepMusicRequest(flag) {
    getSleepMusic({
        self: 1,
        start: musicRequestStart,
        length: musicRequestLength
    }, flag)

    musicRequestStart += musicRequestLength
}

function dietRecipeRequest(flag) {
    getDietRecipe({
        self: 1,
        start: recipeRequestStart,
        length: recipeRequestLength
    }, flag)

    recipeRequestStart += recipeRequestLength
}

function refreshHandler() {
    refreshTrigger.value = true

    if (releaseItemDisplay.value) {
        musicItemActive.value ? sleepMusicRequest(true) : dietRecipeRequest(true)
    } else {
        getSleepMusicByIdArr()
    }
}

function scrollToLowerHandler() {
    if (releaseItemDisplay.value) {
        musicItemActive.value ? sleepMusicRequest(false) : dietRecipeRequest(false)
    } else {
        getSleepMusicByIdArr()
    }
}

function getSleepMusicByIdArr() {
    let array = fondSleepMusicList

    if (musicRequestStart >= array.length) musicTotalDataLoadDone = true

    array.slice(musicRequestStart, musicRequestLength + musicRequestStart)
    array = array.map(v => v.music_id)

    getSleepMusic(array)

    musicRequestStart += musicRequestLength
}

function getRecipeByIdArr() {
    let array = fondRecipeList

    if (recipeRequestStart >= array.length) recipeTotalDataLoadDone = true

    array.slice(recipeRequestStart, recipeRequestLength + recipeRequestStart)
    array = array.map(v => v.recipe_id)

    getDietRecipe(array)

    recipeRequestStart += recipeRequestLength
}

const $http = inject('$http')
const sleepMusicList = ref([])
let recipeList = ref([])
let musicItemActive = ref(true)
let musicRequestStart = 0, musicRequestLength = 10
let recipeRequestStart = 0, recipeRequestLength = 10
const store = useStore()
const scrollHeight = store.state.system.availableHeight
const topTitle = ref(), isDeleting = ref(false)
const confirmBoxDisplay = ref()
const middleTitle = ref()
const musicItemIdObj = ref({})
const recipeItemIdObj = ref({})
let prepDeleteId
let musicTotalDataLoadDone = false, recipeTotalDataLoadDone = false
const refreshTrigger = ref(false)
let screenWidth = computed(() => store.state.system.screenWidth)
const marginLeft = ref(0)
let originMarginLeft, originPageX, currentScrollTop = 0
let anotherScrollTopRecord = 0
const scrollTop = ref(0), display = ref(false), message = ref('')
const musicListHeight = ref(), recipeListHeight = ref()
const totalContainerHeight = ref(0)
const topBarHeight = store.state.system.statusHeight + store.state.system.navigationHeight
const scanItem = ref()
const detailDisplay = ref(false)
const attrs = useAttrs()
let releaseItemDisplay = computed(() => attrs.releaseStatus)
let fondSleepMusicList = [], fondRecipeList = []
let defaultAddHeight = 32 + 14 + 16 - topBarHeight + 15

watch(releaseItemDisplay, () => {
    sleepMusicList.value = []
    recipeList.value = []
    recipeItemIdObj.value = []
    musicItemIdObj.value = []
    recipeRequestStart = 0, recipeRequestLength = 10
    musicRequestStart = 0, musicRequestLength = 10
})

onLoad(() => {
    if (releaseItemDisplay.value) {
        sleepMusicRequest(false)
        musicRequestLength = 4

        dietRecipeRequest(false)
        recipeRequestLength = 4
    } else {
        watch(() => attrs.confirmList, (val) => {
            if (val) {
                fondSleepMusicList = val.filter(v => v.music_id)
                fondRecipeList = val.filter(v => !v.music_id)

                getSleepMusicByIdArr()
                musicRequestLength = 4

                getRecipeByIdArr()
                recipeRequestLength = 4

            }
        }, { immediate: true })
    }
})

watch([musicListHeight, recipeListHeight, musicItemActive], (val, oldVal) => {
    if (musicItemActive.value) {
        totalContainerHeight.value = (musicListHeight.value - defaultAddHeight) || (scrollHeight - topBarHeight)
    } else {
        totalContainerHeight.value = (recipeListHeight.value - defaultAddHeight) || (scrollHeight - topBarHeight)
    }

    if (val[2] !== oldVal[2]) {
        manageShiftScrollTop(currentScrollTop)
    }
}, { immediate: true })

</script>

<style lang="less" scoped>
.container {
    width: 100vw;

    .scroll {
        display: flex;
        overflow: hidden;
        width: 100vw;
        position: relative;

        .music-container,
        .recipe-container {
            width: 100vw;

            .recipeSpaceOccupy {
                width: 10px;
                height: 32px + 16px + 14px;
            }

            .shift {
                flex-shrink: 0;
                width: 118px;
                font-size: 14px;
                height: 32px;
                margin: 0 auto 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
                border-radius: 4px;

                .music {
                    text-align: right;
                }

                .recipe {
                    text-align: left;
                }

                .middle {
                    margin: 0 4px;
                }

                .active {
                    font-weight: bold;
                    color: #0D7377;
                }
            }

            .music-recipe {
                flex-shrink: 0;
                width: 100vw;
                display: flex;
                overflow: hidden;
                transition: 0.2s;

                .notContentContainer {
                    width: 150px;
                    height: 36px;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .music-list {
                    transition: 0.3s;
                }

                .music-list,
                .recipe-list {
                    width: 100vw;
                    flex-shrink: 0;

                    .item {
                        margin: 0 auto 12px;
                        height: 90px;
                    }

                    .deleteExecute {
                        overflow: hidden;
                        transition: 0.4s;
                        height: 0px;
                        margin: 0;
                        opacity: 0;
                    }
                }
            }
        }
    }
}
</style>
