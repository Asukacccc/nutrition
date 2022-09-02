<template>
    <view class="container">
        <nav-bar :isBack="true" title="营养分析"></nav-bar>
        <scroll-view scroll-y :style="{ height: scrollViewHeight + 'px' }" class="analyze-container">
            <view class="analyze calories">
                <view class="caption">热量分析</view>
                <view class="content">
                    <view class="item" v-for="(v, i) in calArray" :key="i">
                        <view class="left column">{{ v[0] }}</view>
                        <view class="center column">{{ v[1] }}</view>
                        <view class="right column">{{ v[2] }}</view>
                    </view>
                </view>
            </view>
            <view class="analyze main" v-if="mainArray.length">
                <view class="caption">三大营养素分析</view>
                <view class="content">
                    <view class="item" v-for="(v, i) in mainArray" :key="i">
                        <view class="left column">{{ v[0] }}</view>
                        <view class="center column"> > {{ v[1] }}</view>
                        <view class="right column">{{ v[2] }}</view>
                    </view>
                </view>
            </view>
            <view class="analyze detail" v-if="detailArray.length">
                <view class="caption">其他营养素分析</view>
                <view class="content">
                    <view class="detail-item" v-for="(v, i) in detailArray" :key="i">
                        <view class="detail-left detail-column">{{ v[0] }}</view>
                        <view class="detail-center detail-column"> > {{ v[1] }}</view>
                        <view class="detail-right detail-column">{{ v[2] }}</view>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>

import { useStore } from 'vuex'
import { computed, ref, inject } from 'vue'

async function requestIngredient(array) {
    let resultArray = []

    for (let i of array) {
        const requestResult = await $http.requestIngredient(i)

        if (requestResult.code === 250) continue
        if (requestResult.code !== 200) return resultArray

        resultArray.push((function () {
            if (requestResult !== undefined) {
                for (let u in requestResult['newslist'][0]) {
                    if (u !== 'name' && u !== 'type') {
                        requestResult['newslist'][0][u] *= foodCountArray[i]
                    }
                }
            }

            return requestResult['newslist'][0]
        })())
    }

    return resultArray
}

const store = useStore()
const mainArray = ref([])
const detailArray = ref([])
const $http = inject('$http')
let idSetArray = {}

const scrollViewHeight = computed(() => store.state.system.availableHeight)

for (let i of JSON.parse(JSON.stringify(store.state.diet.todayRecordList))) {
    if (idSetArray[i.time] === undefined) idSetArray[i.time] = []

    if (i.food_id_set.indexOf('-') !== -1) {
        idSetArray[i.time] = [...idSetArray[i.time], ...i.food_id_set.split('-')]
    }
    else idSetArray[i.time].push(i.food_id_set)
}

const calArray = (function () {
    function getTimeTypeCal(index) {
        return recordList.filter(v => v.time === index).reduce((total, v) => {
            for (let i in foodInfoList[v.id]) {
                let existCount = 0
                let count = (function () {
                    let foodCount = 0
                    for (let k of idSetArray[index]) {

                        if (k.split(',')[0] === i) {
                            existCount++
                            foodCount += Number(k.split(',')[1])
                        }
                    }

                    return foodCount
                })()

                count = count / existCount

                total = Number(foodInfoList[v.id][i].heat) * count + (total - 0)
            }

            return Number(total).toFixed(3)
        }, 0)
    }

    const recordList = JSON.parse(JSON.stringify(store.state.diet.todayRecordList))
    const foodInfoList = JSON.parse(JSON.stringify(store.state.diet.foodInfo))

    const breakfastCal = getTimeTypeCal(0) - 0
    const lunchCal = getTimeTypeCal(1) - 0
    const dinnerCal = getTimeTypeCal(2) - 0
    const snackCal = getTimeTypeCal(3) - 0

    return [
        ['名称', '摄入(千卡)', '推荐(千卡)'],
        ['早餐', breakfastCal, '475-664'],
        ['午餐', lunchCal, '664-854'],
        ['晚餐', dinnerCal, '475-854'],
        ['加餐', snackCal, '0-190'],
        ['总摄入', breakfastCal + lunchCal + dinnerCal + snackCal, '1708-2088']
    ]
})();

const foodInfo = JSON.parse(JSON.stringify(store.state.diet.foodInfo))
const array = []
const foodCountArray = {};

(function () {
    const foodInfo = JSON.parse(JSON.stringify(store.state.diet.foodInfo))

    const requestIngredientArray = (async function () {
        function computeIngredient(text) {
            return ingredientArray.reduce((total, v) => {

                return total += text === 'zf' || text === 'dbz' || text === 'shhf' ? v[text] : v[text] / 100
            }, 0).toFixed(3)
        }

        const array = []

        for (let i in foodInfo) {
            for (let k in foodInfo[i]) {
                array.push(foodInfo[i][k].name)

                foodCountArray[foodInfo[i][k].name] = (foodCountArray[foodInfo[i][k].name] || 0) + 1
            }
        }

        const ingredientArray = await requestIngredient(new Set(array))

        if (!ingredientArray.length) return

        mainArray.value = [
            ['名称', '摄入(g)', '推荐(g)'],
            ['脂肪', computeIngredient('zf'), '20-35'],
            ['蛋白质', computeIngredient('dbz'), '46-56'],
            ['碳水化合物', computeIngredient('shhf'), '110-150']
        ]

        detailArray.value = [
            ['名称', '摄入(g)', '推荐(g)'],
            ['硫胺素', computeIngredient('las'), '0.0012-0.0014'],
            ['钙', (computeIngredient('gai') / 1000).toFixed(3), '0.7-0.9'],
            ['硫磺素', computeIngredient('su'), '0.0012-0.0014'],
            ['镁', computeIngredient('mei'), '0.3-0.5'],
            ['烟酸', computeIngredient('ys'), '0.2-0.6'],
            ['铁', computeIngredient('tei'), '0.011-0.013'],
            ['维生素C', computeIngredient('wsfc'), '0-0.2'],
            ['锰', computeIngredient('meng'), '0.004-0.005'],
            ['膳食纤维', computeIngredient('ssxw'), '0.23-0.27'],
            ['维生素E', computeIngredient('wsse'), '0.012-0.014'],
            ['锌', computeIngredient('xin'), "0.012-0.013"],
            ['维生素A', computeIngredient('wssa'), '0.00006-0.0001'],
            ['胆固醇', computeIngredient('dgc'), '0.4-0.6'],
            ['铜', computeIngredient('tong'), '0.0005-0.0011'],
            ['胡萝卜素', computeIngredient('lb'), '0.0036-0.0045'],
            ['钾', computeIngredient('jia'), '1-3'],
            ['磷', computeIngredient('ling'), '0.68-0.76'],
            ['视黄醇当量', computeIngredient('shc'), '0.5-0.6'],
            ['钠', computeIngredient('la'), '1-2'],
            ['硒', (computeIngredient('xi') / 1000).toFixed(3), '0-0.00008'],
        ]
    })()
})()


</script>

<style lang="less" scoped>
.container {
    .analyze-container {
        .calories {
            .content {
                .item {
                    &:last-child {
                        margin-top: 4px;
                        font-weight: bold;
                    }
                }
            }
        }

        .analyze {
            width: 350px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
            padding-bottom: 10px;

            .caption {
                color: #0D7377;
                background-color: #4FEAD0;
                width: max-content;
                padding: 0 10px;
                height: 34px;
                border-bottom-right-radius: 10px;
                line-height: 34px;
                text-align: center;
                margin-bottom: 20px;
            }

            .content {
                padding: 10px 16px;
                width: 300px;
                margin: 0 auto;
                background-color: #E8E8E8;
                border-radius: 10px;
                box-sizing: border-box;
                font-size: 12px;

                .item,
                .detail-item {
                    display: flex;

                    &:first-child {
                        font-size: 14px;
                        color: #7129FF;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }

                    .column,
                    .detail-column {
                        flex: 1;
                        text-align: center;
                        height: 20px;
                        line-height: 20px;
                    }

                    .left,
                    .detail-left {
                        text-align: left;
                    }

                    .center,
                    .detail-center {
                        text-align: center;
                    }

                    .right,
                    .detail-right {
                        text-align: right;
                    }
                }
            }
        }

        .detail .content {
            width: 320px;
        }
    }
}
</style>
