<template>
    <view class="container">
        <nav-bar isBack="false" title="听闻"></nav-bar>
        <view class="list-container">
            <navigator class="sleep-music" url="/sub-package/sleep-music/index/index">
                <view class="icon-title">
                    <view class="icon">
                        <image src="../../static/icon/listen-smell/sleep.png" class="icon-image"></image>
                    </view>
                    <view class="text">听此助眠曲</view>
                </view>
                <uni-icons type="arrowright" size="18"></uni-icons>
            </navigator>
            <navigator  class="diet-recipe" url="/sub-package/diet-recipe/index/index">
                <view class="icon-title">
                    <view class="icon">
                        <image src="../../static/icon/listen-smell/diet.png" class="icon-image"></image>
                    </view>
                    <view class="text">闻此食谱香</view>
                </view>
                <uni-icons type="arrowright" size="18"></uni-icons>
            </navigator>
        </view>
    </view>
</template>


<style lang="less" scoped>

.container {
    .list-container {
        .sleep-music, .diet-recipe {
            width: 340px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 0 14px;
            margin: 14px auto;
            background-color: white;
            border-radius: 10px;
            overflow: hidden;

            .icon-title {
                display: flex;
                align-items: center;
                width: 100px;
                justify-content: space-between;

                .icon {
                    flex-shrink: 0;
                    width: 26px;
                    height: 26px;
                    margin-right: 10px;

                    .icon-image {
                        width: 100%;
                        height: 100%;
                        display: block;
                    }
                }

                .text {
                    white-space: nowrap;
                }
            }
        }
    }
}

</style>