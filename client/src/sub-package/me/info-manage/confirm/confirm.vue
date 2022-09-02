<template>
    <view class="container">
        <nav-bar isBack="true" title="我所认可的"></nav-bar>
        <list-component :releaseStatus="false" :confirmList="confirmList"></list-component>
    </view>
</template>

<script setup>

import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue'
import ListComponent from '../../../../components/list.vue';

const confirmList = ref()

onLoad((option) => {
    confirmList.value = JSON.parse(option.totalConfirmList)
})

</script>

