<template>
    <view class="change-container">
        <nav-bar title="修改个人信息" isBack="true"></nav-bar>
        <view class="list">
            <view class="item" @click="avatarHandler">
                <view class="caption">修改头像</view>
            </view>
            <view class="item" @click="showInput(0)">
                <view class="caption">修改昵称</view>
                <view class="short">{{ nickname }}</view>
            </view>
            <view class="item" @click="showInput(1)">
                <view class="caption">修改签名</view>
                <view class="short">{{ signature }}</view>
            </view>
        </view>
    </view>
    <change-info :container="inputContainer" :tip_1="tip_1" :tip_2="tip_2" @closeInput="closeInput">
    </change-info>
    <image-crop :src="imageSrc" cropRadio="1" :imageWidth="imageWidth" :display="avatarCropDisplay"
        :imageRadio="imageRadio" @closeCropBox="closeCropBox" cropTitle="头像裁剪" @getCropResult="getCropResult">
    </image-crop>
</template>

<script setup>

import { useStore } from 'vuex'
import { computed, ref, inject } from 'vue'
import ChangeInfo from '../../../../components/change-info.vue'
import ImageCrop from '../../../../components/image-crop.vue'

function showInput(v) {
    inputContainer.value = 'true'
    if (v === 0) {
        tip_1.value = '昵称'
        tip_2.value = 10
    } else {
        tip_1.value = '签名'
        tip_2.value = 20
    }
}

async function getCropResult(res) {
    let { data: uploadResult } = await $http.uploadAvatar(res)

    try {
        uploadResult = JSON.parse(uploadResult)
    } catch (e) {
        uni.showToast({
            title: '上传失败',
            icon: 'none'
        })
        closeCropBox()
    }

    if (uploadResult.status === 0) {
        $http.getUserInfo()
        uni.showToast({
            title: '上传成功',
            icon: 'none'
        })
        closeCropBox()
    } else {
        uni.showToast({
            title: '上传失败',
            icon: 'none'
        })
        closeCropBox()
    }
}

function closeInput() {
    inputContainer.value = ''
}

function closeCropBox() {
    avatarCropDisplay.value = ''
}

function avatarHandler() {
    uni.chooseMedia({
        count: 1,
        success(res) {
            uni.getImageInfo({
                src: res.tempFiles[0].tempFilePath,
                success(infoResult) {
                    imageSrc.value = infoResult.path
                    imageWidth.value = infoResult.width
                    avatarCropDisplay.value = 'true'
                    imageRadio.value = infoResult.width / infoResult.height
                }
            })
        },
        fail() {
            uni.showToast({
                title: '已取消选择',
                icon: 'none'
            })
        }
    })
}

const store = useStore()
let nickname = ''
let signature = ''
const inputContainer = ref('')
const tip_1 = ref('')
const tip_2 = ref('')
const imageSrc = ref()
const imageWidth = ref('')
const avatarCropDisplay = ref('')
const imageRadio = ref(1)
const $http = inject('$http')

nickname = computed(() => { return store.state.user.nickname })
signature = computed(() => { return store.state.user.signature })
</script>

<style lang="less" scoped>
.change-container {
    .list {
        width: 328px;
        margin: 0 auto;

        .item {
            width: 100%;
            height: 42px;
            background-color: white;
            border-radius: 10px;
            margin-top: 14px;
            display: flex;
            padding: 0 16px;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;

            .caption {
                font-size: 14px;
            }

            .image {
                width: 16px;
            }

            .short {
                width: 150px;
                text-align: right;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 14px;
                color: #A5A5A5;
            }

            &:hover {
                opacity: .8;
            }
        }
    }
}
</style>