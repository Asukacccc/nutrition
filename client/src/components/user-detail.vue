<template>
    <view :class="['user-container', display ? 'active' : '']" :style="{ marginTop: topBarHeight / 2 + 'px' }">
        <view class="title">Ta的信息</view>
        <view @click="closeHandler">
            <image src="../../static/icon/component/close.png" class="close-icon" mode="widthFix"></image>
        </view>
        <view class="avatar item">
            <view class="abstract">头像</view>
            <image :src="avatar" v-if="avatar" class="avatar-image"></image>
        </view>
        <view class="nickname item">
            <view class="abstract">昵称</view>
            <view class="specific-nickname">{{ nickname }}</view>
        </view>
        <view class="music-count item">
            <view class="abstract">发布的助眠曲数量</view>
            <view class="count">{{ musicCount }}</view>
        </view>
        <view class="recipe-count item">
            <view class="abstract">发布的食谱数量</view>
            <view class="count">{{ recipeCount }}</view>
        </view>
        <view class="signature item">
            <view class="abstract">签名</view>
            <view class="specific-signature">{{ signature }}</view>
        </view>
    </view>
</template>

<script setup>

import { useAttrs, ref, computed, inject, watch } from 'vue'
import { useStore } from 'vuex'
import request from '../fly/index'
import showToast from '../utils/showToast'

function avatarHandler(src) {
    if (src[0] === 'h') return src
    else {
        return `${request.config.baseURL}/user/get-avatar/${src}`
    }
}

async function requestCount(info) {
    const result = await $http.getUserReleaseCount(info)

    if (result.status) return showToast()

    musicCount.value = result.sleep
    recipeCount.value = result.recipe
}

function closeHandler() {
    emit('closeDetailContainer')
}

const attrs = useAttrs()
const backgroundDisplay = ref('')
const store = useStore()
const musicCount = ref(0)
const recipeCount = ref(0)
const $http = inject('$http')
const avatar = ref(), nickname = ref()
const signature = ref()
const display = ref(false)
const emit = defineEmits(['closeDetailContainer'])

let topBarHeight = computed(() => store.state.system.statusHeight + store.state.system.navigationHeight)

watch(() => attrs.userDetail, val => {
    if (val) {
        display.value = true
        signature.value = attrs.user.sign || '我还什么都没写'

        avatar.value = avatarHandler(attrs.user.avatar)
        
        nickname.value = attrs.user.nickname

        requestCount({ id: attrs.workId, isMusic: attrs.musicFlag })
    } else {
        display.value = false   
    }
})


</script>

<style lang="less" scoped>
.user-container {
    position: absolute;
    background-color: white;
    width: 340px;
    margin: 0 auto;
    padding: 16px 22px 40px;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .title {
        color: #0D7377;
        font-size: 16px;
        margin: 0 auto 16px;
        position: relative;
        text-align: center;

        &::after {
            content: '';
            position: absolute;
            opacity: 0.25;
            height: 2px;
            background-color: #707070;
            width: 428px;
            bottom: -8px;
            left: 50%;
            transform: translate(-50%) scale(0.5);
        }
    }

    .close-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 20px;
        z-index: 2;
    }

    .item {
        margin-bottom: 18px;

        .abstract {
            font-size: 12px;
            color: #929292;
            margin-bottom: 4px;
        }

        .avatar-image {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: block;
        }

        .specific-nickname {
            font-size: 16px;
            color: #0D7377;
        }

        .count {
            font-size: 16px;
            color: #5A5A5A;
        }

        .specific-signature {
            font-size: 14px;
            color: #5A5A5A;
        }
    }
}

.active {
    opacity: 1;
    pointer-events: auto;
}
</style>

