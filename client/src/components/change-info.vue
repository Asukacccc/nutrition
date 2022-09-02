<template>
    <view class="container">
        <shallow-background :backgroundDisplay="backgroundDisplay" backgroundColor="#b5b5b5"></shallow-background>
        <hint-message :message="message" :display="display"></hint-message>
        <view
            :class="['input-container', containerDisplay === 'true' ? 'active-container' : '']">
            <view class="content">
                <view class="title">
                    <view class="tip-1">{{ tip_1 }}修改</view>
                    <view class="tip-2">限{{ tip_2 }}字</view>
                </view>
                <form>
                    <input class="input" type="text" :maxlength="tip_2" :focus="focus" confirm-type="done"
                        @input="inputHandler" :value="inputValue">
                    <view class="button">
                        <button class="cancel" formType="reset" @click="cancelHandler">取消</button>
                        <button class="confirm" formType="reset" @click="confirmChangeInfo">确定</button>
                    </view>
                </form>
            </view>
        </view>
    </view>
</template>

<script setup>
import {
    ref,
    useAttrs,
    computed,
    defineEmits,
    inject,
    getCurrentInstance
} from 'vue'
import ShallowBackground from './shallow-background.vue'
import HintMessage from './hint-message.vue'
import showToast from '../utils/showToast'

function inputHandler(e) {
    inputValueRecord = e.detail.value
    if (e.detail.value.length >= tip_2.value) {
        display.value = String(Math.random())
        if (tip_1.value === '昵称') {
            message.value = `昵称长度不可超过${tip_2.value}字`
        } else if (tip_1.value === '签名') {
            message.value = `签名长度不可超过${tip_2.value}字`
        }
    }
}

async function confirmChangeInfo() {

    if (inputValueRecord.trim() === '') {
        display.value = String(Math.random())
        message.value = `${tip_1.value} 不可为空`
        focus.value = false
        setTimeout(() => {
            focus.value = true
        }, 0)
        return
    }

    if (tip_1.value === '昵称') {
         const nicknameChangeResult =  $http.setUserInfo({ nickname: inputValueRecord })

         if (nicknameChangeResult.status) return showToast('修改名称失败')
    }
    else if (tip_1.value === '签名') {
        const signatureChangeResult = await $http.setUserInfo({ sign: inputValueRecord })
        
        if (signatureChangeResult.status) return showToast('修改签名失败')
    }

    cancelHandler()
}

function cancelHandler() {
    backgroundDisplay.value = ''
    inputValueRecord = ''
    emit('closeInput')
}

const attrs = useAttrs()
let tip_1 = '',
    tip_2 = ''
let containerDisplay = ref('false')
const message = ref('')
const display = ref('')
const backgroundDisplay = ref('')
const emit = defineEmits(['closeInput'])
const inputValue = ref('')
const $http = inject('$http')
const instance = getCurrentInstance()
let inputValueRecord = ''
const focus = ref(false)

tip_1 = computed(() => {
    return attrs.tip_1
})

tip_2 = computed(() => {
    return Number(attrs.tip_2)
})

containerDisplay = computed(() => {
    if (attrs.container === 'true') {
        backgroundDisplay.value = 'true'
        focus.value = true
    }

    return attrs.container
})
</script>

<style lang="less" scoped>
.container {
    .input-container {
        overflow: hidden;
        transition: 0s;
        transform: scale(10);
        pointer-events: none;
        opacity: 0;

        .content {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 328px;
            display: flex;
            flex-direction: column;
            z-index: 1;

            .title {
                padding: 0 10px;
                background-color: white;
                line-height: 28px;
                box-sizing: border-box;
                height: 28px;
                font-size: 12px;
                border-radius: 5px;
                display: inline-block;
                width: max-content;

                .tip-1 {
                    color: #0d7377;
                    margin-right: 10px;
                    float: left;
                }

                .tip-2 {
                    float: left;
                    color: #b2b2b2;
                }
            }

            .input {
                width: 100%;
                height: 48px;
                border-radius: 8px;
                margin: 14px 0 16px;
                background-color: white;
                padding-left: 10px;
                box-sizing: border-box;
            }

            .button {
                display: flex;
                justify-content: flex-end;
                font-size: 12px;

                .confirm,
                .cancel {
                    margin: 0;
                    padding: 0;
                    font-size: 12px;
                    height: 30px;
                    line-height: 30px;
                    width: 70px;
                    border-radius: 6px;
                    text-align: center;
                    background-color: white;

                    &:hover {
                        opacity: 0.8;
                    }
                }

                .confirm {
                    color: white;
                    background-color: #0d7377;
                    margin-left: 14px;
                }
            }
        }

    }

    .active-container {
        transform: scale(1);
        transition: 0.2s;
        opacity: 1;
        pointer-events: auto;
        overflow: visible;
    }
}
</style>