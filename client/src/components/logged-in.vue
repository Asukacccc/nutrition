<template>
    <view class="in-container">
        <user-panel></user-panel>
        <view class="feature">
            <navigator class="item" url="/sub-package/me/info-manage/release/release">
                <view class="caption">
                    <image class="image" src="../static/icon/me-page/release.png" mode="widthFix"></image>
                    <view class="text">我所发布的</view>
                </view>
                <view class="count">{{ userRelease }}</view>
            </navigator>
            <navigator class="item"
                :url="'/sub-package/me/info-manage/confirm/confirm?totalConfirmList=' + totalConfirmList">
                <view class="caption">
                    <image class="image" src="../static/icon/me-page/confirm.png" mode="widthFix"></image>
                    <view class="text">我所认可的</view>
                </view>
                <view class="count">{{ userFond }}</view>
            </navigator>
            <navigator class="item" url="/sub-package/me/feedback/index/index">
                <view class="caption">
                    <image class="image" src="../static/icon/me-page/feedback.png" mode="widthFix"></image>
                    <view class="text">意见与反馈</view>
                </view>
                <image class="arrow" src="../static/icon/me-page/right-arrow.png" mode="widthFix"></image>
            </navigator>
            <button class="item button" open-type="share" url="#" @click="changeRightHandler">
                <view class="caption">
                    <image class="image" src="../static/icon/me-page/option.png" mode="widthFix"></image>
                    <view class="text">分享小程序</view>
                </view>
            </button>
        </view>
    </view>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { onShow, onReady, onShareAppMessage } from '@dcloudio/uni-app'
import UserPanel from '../components/user-panel.vue'
import showToast from '../utils/showToast.js'
import { useStore } from 'vuex'
import Navigation from '../minis/navigation.vue'
import ChangeInfo from './change-info.vue'

const userRelease = ref(0)
const userFond = ref(0)
const $http = inject('$http')
const totalConfirmList = ref()
const store = useStore()
const inputContainer = ref()

function closeInput() {
    inputContainer.value = ''
}

async function releaseCount() {
    const countResult = await $http.getUserReleaseCount()

    userRelease.value = countResult.sleep + countResult.recipe
}

async function fondCount() {
    const { message } = await $http.getUserFondList()

    totalConfirmList.value = JSON.stringify(message)
    userFond.value = message.length
}

onShow(() => {
    releaseCount()
    fondCount()
})

releaseCount()
fondCount()

</script>

<style lang="less" scoped>
.in-container {
    .feature {
        margin: 20px auto 0;
        display: flex;
        width: 328px;
        flex-direction: column;

        .item {
            height: 42px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: white;
            margin-bottom: 10px;
            border-radius: 10px;
            padding: 0 14px;
            box-sizing: border-box;

            &:nth-child(3) {
                margin-bottom: 20px;
            }

            &:last-child {
                border-radius: 14px;
                border: none;
                outline: none;
            }

            .caption {
                font-size: 14px;
                display: flex;
                align-items: center;

                .text {
                    margin-left: 10px;
                }
            }

            .image {
                width: 26px;
            }

            .arrow {
                width: 16px;
            }

            .right,
            .not-right {
                width: 16px;
            }

            .count {
                font-size: 14px;
                color: #a5a5a5;
            }
        }
    }
}
</style>