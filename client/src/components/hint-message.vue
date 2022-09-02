<template>
    <view :style="{ top: top + 'px' }" :class="['message-container', display !== '' ? 'display' : '']">
        {{ message }}
    </view>
</template>

<script setup>
import { useAttrs, computed, ref, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const attrs = useAttrs()
let top = 0
let message = '', display = ref('')
let timeRecord = 0

top = computed(() => store.state.system.navigationHeight + store.state.system.statusHeight - 24)

message = computed(() => {
    return attrs.message
})

watch(() => attrs.display, () => {
    if (new Date().getTime() - timeRecord < 3000) return

    display.value = '1'
    timeRecord = new Date().getTime()

    setTimeout(() => {
        display.value = ''
    }, 3000)
})
</script>

<style lang="less" scoped>
.message-container {
    position: fixed;
    left: 0;
    height: 24px;
    width: 100vw;
    background-color: lightseagreen;
    color: yellow;
    line-height: 24px;
    font-size: 14px;
    text-align: center;
    z-index: 2;
}

.display {
    animation: hint 3s 1;
}

@keyframes hint {
    0% {
        margin-top: 0;
    }

    50% {
        margin-top: 24px;
    }

    100% {
        margin-top: 0;
    }
}
</style>