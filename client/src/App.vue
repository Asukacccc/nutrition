<template>

</template>

<script setup>
import { inject } from 'vue'
import { onUnload, onLaunch } from '@dcloudio/uni-app'

const $http = inject('$http')
const token = uni.getStorageSync('token');

(async function () {
    if (!token) {
        await $http.getToken()
    }
    $http.getUserInfo()
})()

onUnload(() => {
    uni.removeStorageSync('token')
})

uni.onNetworkStatusChange(res => {
    if (!res.isConnected) {
        uni.showToast({
            title: '网络错误',
            duration: 2000,
            icon: 'none'
        })
    }
})

</script>

<style lang="less">
page {
    height: 100%;
    background-color: #efefef;
    display: flex;
    flex-direction: column;
    justify-content: flex-start
}
</style>