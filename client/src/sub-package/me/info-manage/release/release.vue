<template>
    <view class="container">
        <nav-bar isBack="true" title="我所发布的"></nav-bar>
        <view class="release-container">
            <list-component :releaseStatus="true"></list-component>    
        </view>
    </view>
</template>

<script setup>

import ListComponent from '../../../../components/list.vue';

</script>