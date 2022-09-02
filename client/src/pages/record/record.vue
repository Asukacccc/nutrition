<template>
    <view class="container">
        <nav-bar isBack="false" title="记录"></nav-bar>
        <view class="list-container" :style="{ height: height + 'px' }">
            <view class="list">
                <navigator class="item recipe" url="/sub-package/record/recipe/index/index">
                    <image class="item-image" src="../../../static/image/sub-package/recipe-record.png"></image>
                </navigator>
                <navigator class="item sleep" url="/sub-package/record/sleep/index/index">
                    <image class="item-image" src="../../../static/image/sub-package/sleep-record.png"></image>
                </navigator>
            </view>
        </view>
    </view>
</template>

<script setup>

import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex'

const store = useStore()

const screenHeight = computed(() => store.state.system.screenHeight)
const availableHeight = computed(() => store.state.system.availableHeight)
const height = computed(() => availableHeight.value - (screenHeight.value - availableHeight.value))



</script>

<style lang="less" scoped>
.container {
    .list-container {
        display: flex;
        align-items: center;
        justify-content: center;

        .list {
            display: flex;
            flex-direction: column;
            height: 342px;
            justify-content: space-between;
            align-items: center;

            .item {
                overflow: hidden;
                width: 156px;
                height: 156px;

                .item-image {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}
</style>