<template>
    <view class="me-container">
        <nav-bar isBack="false" title="我"></nav-bar>
        <logged-in v-if="display"></logged-in>
        <not-login v-else></not-login>
    </view>
</template>

<script setup>
import NotLogin from '../../components/not-login.vue' 
import LoggedIn from '../../components/logged-in.vue'
import { computed, ref } from 'vue';
import { useStore } from 'vuex'
import { onLoad } from '@dcloudio/uni-app'

const store = useStore() 

let display = computed(() => { return store.state.user.nickname !== '' })
</script>