<template>
    <navigator class="panel-container" :url="navigatorUrl">
        <view class="content">
            <view class="info">
                <view class="avatar">
                    <image class="image" src="../static/image/avatar/default-avatar.png"
                        mode="widthFix" :style="{ width: '58px' }" v-if="!avatar"></image>
                    <image :src="avatar" class="image" mode="widthFix"
                        :style="{ width: '58px', height: '58px' }" v-else></image>
                </view>
                <view class="name-signature">
                    <view class="name">
                        {{ nickname }}
                    </view>
                    <view class="signature" v-if="avatar !== ''">
                        <view class="text">{{ signature }}</view>
                    </view>
                </view>
            </view>
            <uni-icons type="arrowright" size="14"></uni-icons>
        </view>
    </navigator>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useStore } from 'vuex'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import request from '../fly/index.js'

const store = useStore()
let avatar = ref('')
let nickname = '你的名字'
let signature
const navigatorUrl = ref('#')
const $http = inject('$http')

watch(
    () => store.state.user.avatar,
    async val => {
        if (val === '') return
        if (val.indexOf('https://thirdwx.qlogo.cn/') !== -1) {
            avatar.value = val
            navigatorUrl.value = '/sub-package/me/info-change/main/main'
        } else {
            avatar.value = await $http.getUserAvatar(val)
            navigatorUrl.value = '/sub-package/me/info-change/main/main'
        }
    },
    { immediate: true }
)

nickname = computed(() => {
    return store.state.user.nickname || '你的名字'
})

signature = computed(() => {
    return store.state.user.signature || '我还什么都没写'
})
</script>

<style lang="less" scoped>
.panel-container {
    margin: 14px auto 0;
    width: 328px;
    height: 92px;
    background-color: white;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border-radius: 10px;
    justify-content: center;
    overflow: hidden;
    .content {
        width: 300px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .info {
            display: flex;
            justify-content: flex-start;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            .avatar {
                width: 58px;
                height: 58px;
                overflow: hidden;
                border-radius: 50%;
                .image {
                    display: block;
                }
            }
            .name-signature {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: flex-start;
                margin-left: 15px;
                flex: 1;
                overflow: hidden;
                .signature {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    width: 100%;
                    .text {
                        font-size: 12px;
                        color: #a1a1a1;
                        width: calc(100% - 15px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
                .name {
                    width: 100%;
                    font-size: 16px;
                    color: #0d7377;
                    font-weight: bold;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>