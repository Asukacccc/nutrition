<template>
    <view class="container">
        <view class="not-container">
            <view class="tips" :style="{ marginLeft: num || 0 + 'px', transition: '0.3s' }">此处空空如也</view>
        </view>
    </view>
</template>
<script setup>

import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

let num = computed(() => attrs.leftMove)

</script>

<style lang="less" scoped>
.container {
    .not-container {
        .tips {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150px;
            border-radius: 10px;
            height: 36px;
            line-height: 36px;
            text-align: center;
            background-color: white;
            color: #0D7377;
        }
    }
}
</style>