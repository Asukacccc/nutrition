<template>
    <view
        :class="['shallow-container', backgroundDisplay === 'true' ? 'backgroundDisplay' : '']"
        :style="{ height: height + 'px', backgroundColor }"></view>
</template>

<script setup>
import { useStore } from 'vuex'
import { useAttrs, ref, computed } from 'vue'

const store = useStore()
const attrs = useAttrs()
const height = computed(() => store.state.system.screenHeight)
let backgroundDisplay = ''
const backgroundColor = ref('')

backgroundColor.value = computed(() => {
    return attrs.backgroundColor || '#b5b5b5'
})
backgroundDisplay = computed(() => {
    return attrs.backgroundDisplay
})
</script>

<style scoped lang="less">
.shallow-container {
    position: fixed;
    top: 0;
    height: 0;
    width: 100vw;
    opacity: 0;
    transition: 0;
    pointer-events: none;
}

.backgroundDisplay {
    opacity: 0.5;
    transition: 0.5s;
    pointer-events: auto;
}
</style>
