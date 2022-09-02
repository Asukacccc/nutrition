<template>
    <view class="not-container">
        <user-panel></user-panel>
        <view class="button-tip">
            <view class="button" @click="userLogin">登录</view>
            <view class="tip">登录以享有更多信息</view>
        </view>
    </view>
</template>

<script setup>
import UserPanel from '../components/user-panel.vue'
import { inject, ref } from 'vue'

function userLogin() {
    uni.getUserProfile({
        desc: 'get user profile',
        async success({ userInfo }) {
            const setRes = await $http.setUserInfo({ avatar: userInfo.avatarUrl, nickname: userInfo.nickName })
            if (setRes.status !== 0) return
        }
    })
}

const $http = inject('$http')
</script>

<style lang="less" scoped>

.not-container {
    .button-tip {
        display: flex;
        position: absolute;
        top: 80%;
        left: 50%;
        transform: translate(-50%);
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 75px;
        .button {
            width: 136px;
            height: 42px;
            border-radius: 5px;
            text-align: center;
            line-height: 42px;
            background-color: #0D7377;
            color: white;
        }
        .tip {
            color: #A8A8A8;
            font-size: 14px;
        }
    }
}

</style>