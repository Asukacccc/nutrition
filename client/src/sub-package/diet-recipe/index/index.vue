<template>
    <view class="container">
        <nav-bar isBack="true" title="食谱"></nav-bar>
        <hint-message :display="hintDisplay" :message="hintMessage"></hint-message>
        <shallow-background :backgroundDisplay="backgroundDisplay"></shallow-background>
        <user-detail :musicFlag="0" :workId="workId" :userDetail="userDetail" @closeDetailContainer="closeDetailContainer" :user="user"></user-detail>
        <scroll-view scroll-y :style="{ height: scrollHeight + 'px' }" class="list-container" refresher-enabled
            :refresher-triggered="refreshTrigger" @scrolltolower="scrollToLowerHandler"
            @refresherrefresh="refreshHandler">
            <view class="tipsText">点击食谱以阅读或收起</view>
            <view class="list">
                <view class="item" v-for="item in recipeList" :key="item.id"
                    :style="{ height: !itemDisplayObj[item.id] ? '120px' : itemDisplayHeight[item.id] }">
                    <view class="brief" v-if="!itemDisplayObj[item.id]"
                        @click="changeShowDisplay" :data-flag="item.id">
                        <view class="info">
                            <view class="title">{{ item.title }}</view>
                            <view class="user-fond">
                                <view class="user">
                                    <image class="user-image" :src="avatarHandler(item.avatar)"
                                        @click.stop="getUserInfo" :data-flag="item.id"></image>
                                    <view class="nickname" @click.stop="getUserInfo" :data-flag="item.id">{{ item.nickname }}</view>
                                </view>
                                <view class="fond" @click.stop="confirmHandler" :data-flag="item.id">
                                    <image class="fond-image"
                                        :src="(fondCountList[item.id] ? fondCountList[item.id].confirm : false) ? '../../../static/icon/me-page/fond.png' : '../../../static/icon/me-page/not-fond.png'">
                                    </image>
                                    <view class="count">{{ fondCountList[item.id] ?
                                            fondCountList[item.id].length : 0
                                    }}</view>
                                </view>
                            </view>
                        </view>
                        <view class="cover">
                            <image class="cover-image"
                                :src="item.cover ? `${request.config.baseURL}/diet-recipe/image/${item.cover}` : ''"></image>
                        </view>
                    </view>
                    <view :class="['specific']" :id="`detail-${item.id}`" v-else
                        @click="changeShowDisplay" :data-flag="item.id">
                        <view class="recipe-title">{{ item.title }}</view>
                        <view class="content">
                            <view class="recipe-list">
                                <view class="recipe-item" v-for="(item2, i) in itemDetailContent[item.id].message"
                                    :key="i">
                                    <view class="recipe-text">
                                        <view class="number">{{ i + 1 }}.</view>
                                        <view class="text">{{ item2.text }}</view>
                                    </view>
                                    <image class="recipe-image" v-if="item2.imgSrc"
                                        :src="`${request.config.baseURL}/diet-recipe/image/${item2.imgSrc}`"></image>
                                </view>
                            </view>
                            <view class="specific-info">
                                <view class="specific-user-fond">
                                    <view class="specific-user">
                                        <image :src="avatarHandler(item.avatar)" class="specific-user-image"
                                            @click.stop="getUserInfo" :data-flag="item.id"></image>
                                        <view class="specific-nickname" @click.stop="getUserInfo" :data-flag="item.id">{{
                                                item.nickname
                                        }}</view>
                                    </view>
                                    <view class="specific-fond" @click.stop="confirmHandler" :data-flag="item.id">
                                        <image class="specific-fond-image"
                                            :src="(fondCountList[item.id] ? fondCountList[item.id].confirm : false) ? '../../../static/icon/me-page/fond.png' : '../../../static/icon/me-page/not-fond.png'">
                                        </image>
                                        <view class="specific-count">{{ fondCountList[item.id] ?
                                                fondCountList[item.id].length : 0
                                        }}</view>
                                    </view>
                                </view>
                                <uni-icons type="arrowup" color="#0D7377" size="16"></uni-icons>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
        <view class="release" @click="releaseHandler">
            <image class="release-image" src="../../../static/image/component/release.png"></image>
        </view>
    </view>
</template>

<script setup>

import { computed, inject, reactive, ref, getCurrentInstance, nextTick } from 'vue'
import { useStore } from 'vuex'
import showToast from '../../../utils/showToast'
import HintMessage from '../../../components/hint-message.vue'
import request from '../../../fly/index.js'
import UserDetail from '../../../components/user-detail.vue'
import ShallowBackground from '../../../components/shallow-background.vue'
import { onShow } from '@dcloudio/uni-app'

function releaseHandler() {
    const avatar = store.state.user.avatar

    if (!avatar) {
        showToast('尚未登陆, 无法发布')
    } else {
        uni.navigateTo({
            url: '/sub-package/diet-recipe/release/release'
        })
    }
}

function scrollToLowerHandler() {
    requestRecipeList({
        self: 0,
        start: requestStart,
        length: requestLength,
        boundary: 0
    })

    requestStart += requestLength
}

function refreshHandler() {
    refreshTrigger.value = true

    requestRecipeList({
        self: 0,
        start: 0,
        length: 10,
        boundary: recipeList.value[0].time
    }, false)
}

async function changeShowDisplay(e) {
    const id = e.currentTarget.dataset.flag
    const { source } = recipeList.value.find(v => v.id === id)

    if (!itemDisplayObj[id]) {
        itemDetailContent[id] = await $http.getRecipeContent(source)

        nextTick(() => {
            setTimeout(() => {
                query.select(`#detail-${id}`).boundingClientRect(res => {
                    if (!res) return
                    itemDisplayHeight[id] = `${res.height + 20}px`
                })

                query.exec()
            }, 100)
        })

        itemDisplayObj[id] = true
    } else {
        itemDisplayObj[id] = false
    }
}

function closeDetailContainer() {
    userDetail.value = false
    backgroundDisplay.value = ''
}

async function getUserInfo(e) {
    const id = e.currentTarget.dataset.flag
    const result = await $http.getUserInfoByRecipeId(id)

    if (result.status) return showToast()

    userDetail.value = true
    user.value = result.message
    backgroundDisplay.value = 'true'
    workId.value = id
}

async function confirmHandler(e) {
    const id = e.currentTarget.dataset.flag

    if (!store.state.user.avatar) {
        return showToast('尚未登录, 无法认可')
    }

    const updateResult = await $http.confirmRecipe(id)

    if (updateResult.status) return showToast('认可错误')

    fondCountList[id] = await $http.getFondCount(id, false)
}

function avatarHandler(path) {
    if (path[0] === 'h') {
        return path
    } else {
        return `${request.config.baseURL}/user/get-avatar/${path}`
    }
}

async function requestRecipeList(info, push = true) {
    const getResult = await $http.getDietRecipe(info)

    if (!push) setTimeout(() => refreshTrigger.value = false, 100)

    if (getResult.status) return showToast()

    if (!getResult.message.length && !push) {
        hintDisplay.value = Math.random()
        hintMessage.value = '已是最新数据'
    }

    if (!getResult.message.length) {
        hintDisplay.value = Math.random()
        hintMessage.value = '没有数据了'
    }

    recipeList.value = push ? [...recipeList.value, ...getResult.message] : [...getResult.message, ...recipeList.value]

    requestStart += push ? 0 : getResult.message.length

    for (let i of getResult.message) {
        fondCountList[i.id] = await $http.getFondCount(i.id, false)
    }
}

const store = useStore()
const recipeList = ref([])
const $http = inject('$http')
let requestStart = 0, requestLength = 10
const fondCountList = reactive({})
const hintDisplay = ref(), hintMessage = ref()
const userDetail = ref()
const user = ref()
const backgroundDisplay = ref('')
const itemDisplayObj = reactive({})
const itemDisplayHeight = reactive({})
const refreshTrigger = ref()
const itemDetailContent = reactive({})
const instance = getCurrentInstance()
const query = uni.createSelectorQuery().in(instance)
const workId = ref()

let scrollHeight = computed(() => store.state.system.availableHeight)

requestRecipeList({
    self: 0,
    boundary: 0,
    start: requestStart,
    length: requestLength
})

requestStart += requestLength
requestLength = 4

onShow(() => {
    if (recipeList.value.length)
        requestRecipeList({
            self: 0,
            start: 0,
            length: 10,
            boundary: recipeList.value[0].time
        }, false)
})

</script>

<style lang="less" scoped>
.container {
    /deep/ .shallow-container {
        z-index: 1;
    }

    .release {
        position: absolute;
        right: 10px;
        bottom: 20px;

        .release-image {
            width: 60px;
            height: 60px;
            display: block;
        }
    }

    .list-container {
        height: 0px;

        .tipsText {
            color: #8B8B8B;
            font-size: 10px;
            text-align: center;
            height: 34px;
            line-height: 34px;
        }

        .list {
            padding-bottom: 40px;

            .item {
                margin-bottom: 14px;
                height: 120px;
                padding: 10px;
                width: 350px;
                box-sizing: border-box;
                border-radius: 8px;
                margin: 0 auto 14px;
                background-color: white;
                transition: 0.5s;
                overflow: hidden;

                .brief {
                    display: flex;
                    justify-content: space-between;

                    .info {
                        height: 100px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        flex: 1;
                        width: 0;
                        margin-right: 10px;

                        .title {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            font-size: 14px;
                            font-weight: bold;
                        }

                        .user-fond {
                            height: 56px;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;

                            .user {
                                display: flex;
                                align-items: center;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;

                                .user-image {
                                    width: 30px;
                                    height: 30px;
                                    display: block;
                                    margin-right: 6px;
                                    border-radius: 50%;
                                    flex-shrink: 0;
                                }

                                .nickname {
                                    font-size: 12px;
                                    color: #868686;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                            }

                            .fond {
                                display: flex;
                                align-items: center;
                                width: max-content;

                                .fond-image {
                                    display: block;
                                    width: 14px;
                                    height: 14px;
                                    margin-right: 6px;
                                }

                                .count {
                                    font-size: 14px;
                                }
                            }
                        }
                    }

                    .cover {
                        width: 100px;

                        .cover-image {
                            height: 100px;
                            width: 100px;
                            display: block;
                        }
                    }
                }

                .specific {
                    .recipe-title {
                        font-size: 16px;
                        font-weight: bold;
                        text-align: center;
                        margin: auto 14px;
                    }

                    .content {
                        .recipe-list {
                            .recipe-item {
                                margin: 10px auto 40px;
                                border: 1px;
                                position: relative;

                                &::after {
                                    position: absolute;
                                    height: 2px;
                                    bottom: -16px;
                                    width: 524px;
                                    left: 50%;
                                    transform: translateX(-50%) scale(0.5);
                                    background-color: #707070;
                                    content: '';
                                    opacity: 0.25;
                                }


                                .recipe-text {
                                    display: flex;
                                    justify-content: space-between;
                                    font-size: 14px;

                                    .number {
                                        width: 24px;
                                    }

                                    .text {
                                        flex: 1;
                                    }
                                }

                                .recipe-image {
                                    display: block;
                                    width: 140px;
                                    height: 140px;
                                    margin: 8px auto;
                                }
                            }
                        }

                        .specific-info {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            .specific-user-fond {
                                display: flex;
                                flex: 1;
                                margin-right: 20px;
                                width: 0;

                                .specific-user {
                                    display: flex;
                                    align-items: center;
                                    margin-right: 20px;
                                    flex: 1;
                                    width: 0;

                                    .specific-user-image {
                                        width: 30px;
                                        height: 30px;
                                        display: block;
                                        border-radius: 50%;
                                        margin-right: 6px;
                                        flex-shrink: 0;
                                    }

                                    .specific-nickname {
                                        color: #868686;
                                        font-size: 14px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
                                    }
                                }

                                .specific-fond {
                                    flex-shrink: 0;
                                    display: flex;
                                    align-items: center;

                                    .specific-fond-image {
                                        width: 14px;
                                        height: 14px;
                                        display: block;
                                        margin-right: 6px;
                                    }

                                    .specific-count {
                                        font-size: 12px;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>