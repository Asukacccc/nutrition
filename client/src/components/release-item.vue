<template>
    <view class="container">
        <view class="item-container">
            <view class="time-info">
                <view class="title" @click.stop="itemClick">{{ title }}</view>
                <view class="time-fond">
                    <view class="time">{{ time }}</view>
                    <view class="fond">
                        <image class="icon" src="../../static/icon/me-page/fond.png" mode="widthFix"></image>
                        <view class="count">{{ count }}</view>
                    </view>
                </view>
            </view>
            <view class="cover-delete">
                <image class="cover" :src="pictureSrc" mode="aspectFill" @click.stop="itemClick"></image>
                <image class="close-image" src="../static/icon/component/close.png" @click="deleteClick"></image>
            </view>
        </view>
    </view>
</template>

<script setup>

import { useAttrs, ref } from 'vue'
import request from '../fly/index.js'
import secondsToTime from '../utils/time.js'

function itemClick() {
    emit('itemClick')
}

function deleteClick() {
    emit('deleteHandler', item.id)
}

const attrs = useAttrs()
const item = attrs.item
const title = ref()
const time = ref()
const count = ref()
const pictureSrc = ref()
const emit = defineEmits(['deleteHandler', 'itemClick'])

title.value = item.cover !== undefined ? item.title : item.title + ' - ' + item.singer
time.value = secondsToTime(Number(item.time))
count.value = item.welcome

if (item.cover === undefined) {
    pictureSrc.value = `${request.config.baseURL}/sleep-music/source/${item.id}/${Number(item.is_picture) ? 'image' : 'cover'}`
} else {
    pictureSrc.value = item.cover !== '' ? `${request.config.baseURL}/diet-recipe/image/${ item.cover }` : '../static/image/component/not.png'
}

</script>

<style lang="less" scoped>
.container {
    .item-container {
        display: flex;
        justify-content: space-between;
        width: 350px;
        height: 90px;
        padding: 10px;
        background-color: white;
        border-radius: 12px;
        box-sizing: border-box;
        align-items: center;
        margin: 0 auto;

        .time-info {
            width: 220px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;

            .title {
                color: #505050;
                font-size: 16px;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-weight: bold;
            }

            .time-fond {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .time {
                    color: #6F7070;
                    font-size: 12px;
                    max-width: 100%;
                    text-align: right;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                .fond {
                    display: flex;
                    font-size: 12px;
                    color: #505050;
                    align-items: center;

                    .icon {
                        display: block;
                        width: 12px;
                    }

                    .count {
                        margin-left: 4px;
                    }
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
}
</style>