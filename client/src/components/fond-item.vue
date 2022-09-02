<template>
    <view class="item-container">
        <view class="info">
            <view class="title">{{ item.cover !== undefined ? item.title : item.title + ' - ' + item.singer }}</view>
            <view class="user">
                <view class="avatar">
                    <image class="avatar-image" mode="widthFix" :src="avatar"></image>
                </view>
                <view class="name">{{ item.nickname }}</view>
            </view>
        </view>
        <view class="cover-delete">
            <image class="cover" :src="pictureSrc" mode="aspectFill" @click.stop="itemClick"></image>
            <image class="close-image" src="../static/icon/component/close.png" @click="deleteClick"></image>
        </view>
    </view>
</template>

<script setup>

import { useAttrs, ref, inject } from 'vue'
import request from '../fly/index.js'

const attrs = useAttrs()
const item = attrs.item
let pictureSrc
let temp = item.avatar, avatar = ref()
const emit = defineEmits(['deleteHandler', 'itemClick'])
const $http = inject('$http')

function itemClick() {
    emit('itemClick')
}

function deleteClick() {
    emit('deleteHandler', item.id)
}

(async function () {
    if (temp.indexOf('https://thirdwx.qlogo.cn/') !== -1) {
        avatar.value = temp
    } else {
        avatar.value = await $http.getUserAvatar(temp)
    }
})()

if (item.is_picture !== undefined) {
    pictureSrc = `${request.config.baseURL}/sleep-music/source/${item.id}/${Number(item.is_picture) ? 'image' : 'cover'}`
} else {
    pictureSrc = item.cover ? `${request.config.baseURL}/diet-recipe/image/${item.cover}` : '../static/image/component/not.png'
}

</script>

<style lang="less" scoped>
.item-container {
    display: flex;
    width: 350px;
    height: 90px;
    padding: 10px;
    border-radius: 12px;
    background-color: white;
    box-sizing: border-box;
    justify-content: space-between;
    margin: 0 auto;

    .info {
        width: 220px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title {
            color: #505050;
            font-size: 16px;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: bold;
        }

        .user {
            display: flex;
            align-items: center;

            .avatar {
                width: 32px;
                height: 32px;
                overflow: hidden;
                border-radius: 50%;

                .avatar-image {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            }

            .name {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 0;
                margin-left: 4px;
                color: #505050;
                font-size: 14px;
            }
        }
    }

    .cover-delete {
        display: flex;
        width: 100px;
        justify-content: space-between;
        align-items: center;
        height: 100%;

        .close-image {
            width: 16px;
            height: 16px;
            display: block;
        }

        .cover {
            display: block;
            width: 70px;
            height: 70px;
        }
    }
}
</style>