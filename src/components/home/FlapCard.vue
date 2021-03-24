<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
      <div class="flap-card-bg" :class="{'animation': runFlapCardAnimation}" v-show="!runBookCardAnimation">
          <div class="flap-card" v-for="(item, index) in flapCardList" :key="index" :style="{'zIndex': item.zIndex}">
              <div class="flap-card-circle">
                  <div class="flap-card-semi-circle flap-card-semi-circle-left" :style="semiCircleStyle(item, 'left')" ref="left"></div>
                  <div class="flap-card-semi-circle flap-card-semi-circle-right" :style="semiCircleStyle(item, 'right')" ref="right"></div>
              </div>
          </div>
          <div class="point-wrapper">
              <div class="point" :class="{'animation': runPointAnimation}" v-for="item in pointList" :key="item"></div>
          </div>
      </div>
      <div class="book-card" :class="{'animation': runBookCardAnimation}" v-if="runBookCardAnimation">
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" v-lazy="data.cover">
        </div>
        <div class="content-wrapper">
          <div class="title">{{data.title}}</div>
          <div class="author sub-title-medium">{{data.author}}</div>
          <div class="category">{{categoryText()}}</div>
        </div>
        <div class="read-btn" @click.stop="showBookDetailBefore(data)">{{$t('home.readNow')}}</div>
      </div>
    </div>
      <div class="close-btn-wrapper" @click="close">
          <span class="icon-close"></span>
      </div>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import { flapCardList, categoryText } from '../../utils/store'
import { home } from '../../api/store'

export default {
    mixins: [storeHomeMixin],
    // props: {
    //     data: Object
    // },
    data() {
        return {
            flapCardList: flapCardList,
            front: 0,
            back: 1,
            intervalTime: 20, // 每一帧动画的时长
            runFlapCardAnimation: false,
            pointList: null,
            runPointAnimation: false,
            runBookCardAnimation: false
        }
    },
    watch: {
        flapCardVisible(v) {
            if (v) {
                // 开始动画
                this.runAnimation()
            }
        }
    },
    methods: {
        showBookDetailBefore(data) {
            this.showBookDetail(data)
            this.setFlapCardVisible(false)
        },
        categoryText() {
            if (this.data) {
                return categoryText(this.data.category, this)
            } else {
                return ''
            }
        },
        startPointAnimation() {
            this.runPointAnimation = true
            // 烟花动画执行一次后 清除dom元素绑定的animation
            setTimeout(() => {
                this.runPointAnimation = false
            }, 750)
        },
        // 开始执行动画
        runAnimation() {
            // 烟花动画
            this.runFlapCardAnimation = true
            // 卡片翻转动画 卡片登场动画执行完后 再开始卡片翻转动画 烟花动画
            this.timeout = setTimeout(() => {
                this.startFlapCardAnimation()
                this.startPointAnimation()
            }, 300)
            // 卡片翻转2.5s 后 出现推荐
            this.timeout2 = setTimeout(() => {
                this.runBookCardAnimation = true
            }, 2800)
        },
        // 点击X按钮 触发事件
        close() {
            this.setFlapCardVisible(false)
            this.stopAnimation()
            this.runBookCardAnimation = false
            // 当事件还未完成 提前点击关闭  需要清除执行事件的timeout
            // if (this.timeout) {
            //     clearTimeout(this.timeout)
            // }
            // if (this.timeout2) {
            //     clearTimeout(this.timeout2)
            // }
            // 每一次关闭都重新请求随机数据
            this.$nextTick(() => {
                this.callRandom()
            })
        },
        // 动态绑定半圆的style
        semiCircleStyle(item, dir) {
            return {
                backgroundColor: `rgb(${item.r},${item.g},${item.b})`,
                backgroundSize: item.backgroundSize,
                backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
            }
        },
        // 翻转卡片
        rotate(index, type) { // index 第几个圆 type 左半圆还是右半圆
            // 获取一个卡片的属性值 属性值存储在/utils/store.js中
            const item = this.flapCardList[index]
            let dom
            // 判断是哪半圆 获取这个半圆的dom元素 以便后面改变其style
            if (type === 'front') {
                dom = this.$refs.right[index]
            } else {
                dom = this.$refs.left[index]
            }
            // 沿y轴方向转动
            dom.style.transform = `rotateY(${item.rotateDegree}deg)`
            // 通过改变 item._g 改变背景颜色 需要还原颜色的时候直接通过 item.g 还原
            dom.style.backgroundColor = `rgb(${item.r},${item._g},${item.b})`
        },
        // 卡片的每一帧转动
        flapCardRotate() {
            const frontFlapCard = this.flapCardList[this.front]
            const backFlapCard = this.flapCardList[this.back]
            // 前面的半圆 转动角度
            frontFlapCard.rotateDegree += 10
            frontFlapCard._g -= 5
            // 后面的左半圆转动角度 每次减10 颜色 +5
            backFlapCard.rotateDegree -= 10
            backFlapCard._g += 5
            // 第一个临界点 90度
            if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
                // 背面元素覆盖正面元素
                backFlapCard.zIndex += 2
            }
            this.rotate(this.front, 'front')
            this.rotate(this.back, 'back')
            // 第二个临界点 转动达到180度 重置卡片zIndex 开始下一轮转动
            if (frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0) {
                this.next()
            }
        },
        // 第二个临界点 转动达到180度
        next() {
            // 重置卡片 回到转动180度前的位置和颜色
            const frontFlapCard = this.flapCardList[this.front]
            const backFlapCard = this.flapCardList[this.back]
            frontFlapCard.rotateDegree = 0
            backFlapCard.rotateDegree = 0
            frontFlapCard._g = frontFlapCard.g
            backFlapCard._g = backFlapCard.g
            this.rotate(this.front, 'front')
            this.rotate(this.back, 'back')
            // index++ 重置需要转动的两张卡片
            this.front++
            this.back++
            const len = this.flapCardList.length
            // 五张卡片均转动完成 开始循环
            if (this.front >= len) {
                this.front = 0
            }
            if (this.back >= len) {
                this.back = 0
            }
            // // 动态设置 zIndex
            // 五张卡片zIndex 初始为 100 99 98 97 96
            // 每一轮转动 第二张卡片zIndex +2
            // 当一轮转动完成后 五张卡片 zIndex 的情况为 100 101 98 97 96 要对应将其重置为 96 100 99 98 97
            // 即 上一轮转动的第一张卡片zIndex变为最小96 第二张卡片变为100 第三四五张依次加1
            this.flapCardList.forEach((item, index) => {
                item.zIndex = 100 - ((index - this.front + len) % len)
            })
            // 准备工作 预设背面左半圆
            this.prepare()
        },
        // 准备工作 背面左半圆的位置颜色
        prepare() {
            const backFlapCard = this.flapCardList[this.back]
            // 背面的左半圆 应与正面的右半圆 先重合
            backFlapCard.rotateDegree = 180
            // 背面的左半圆转动时 颜色会变化 先将此颜色预先减少  这样转动时颜色一直增加 转动后的颜色才是正确的
            backFlapCard._g = backFlapCard.g - 5 * 18
            this.rotate(this.back, 'back')
        },
        // 重置翻转卡片的front back 和所有卡片的zIndex
        reset() {
            this.front = 0
            this.back = 1
            this.flapCardList.forEach((item, index) => {
                item.zIndex = 100 - index
                item._g = item.g
                item.rotateDegree = 0
                // 卡片回到最初位置
                this.rotate(index, 'front')
                this.rotate(index, 'back')
            })
        },
        // 翻转卡片的动画
        startFlapCardAnimation() {
            // 准备工作 背面的左半圆 应与正面的右半圆 先重合
            this.prepare()
            this.task = setInterval(() => {
                this.flapCardRotate()
            }, this.intervalTime)
            setTimeout(() => {
                this.stopAnimation()
            }, 2500)
        },
        // 清除定时动画 重置卡片
        stopAnimation() {
            this.runFlapCardAnimation = false
            if (this.task) {
                clearInterval(this.task)
            }
            this.reset()
        },
        // 请求随机数据
        callRandom() {
            home().then(response => {
            if (response && response.status === 200) {
                const data = response.data
                // 随机生成 序号 次序号在0-response.data.random.length 之间 且为整数
                const randomIndex = Math.floor(Math.random() * data.random.length)
                this.data = data.random[randomIndex]
            }
        })
        }
    },
    created() {
        this.pointList = []
        for (let i = 0; i < 18; i++) {
            this.pointList.push(`point${i}`)
        }
    },
    mounted() {
        this.callRandom()
    }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
@import '../../assets/styles/flapcard';
.flap-card-wrapper {
    @include absCenter;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .6);
    @include center;
    .close-btn-wrapper{
        position: absolute;
        left: 0;
        bottom: px2rem(30);
        z-index: 1100;
        width: 100%;
        @include center;
        .icon-close {
            width: px2rem(45);
            height: px2rem(45);
            border-radius: 50%;
            background: #333;
            font-size: px2rem(25);
            color: white;
            @include center;
        }
    }
    .flap-card-bg {
        transform: scale(0);
        opacity: 0;
        position: relative;
        width: px2rem(64);
        height: px2rem(64);
        border-radius: px2rem(5);
        background: white;
        &.animation{
            animation: flap-card-move .3s ease-in 1 both;
        }
        @keyframes flap-card-move {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
            75% {
                transform: scale(.9);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        .flap-card {
            width: px2rem(48);
            height: px2rem(48);
            @include absCenter;
            .flap-card-circle{
                display: flex;
                width: 100%;
                height: 100%;
                .flap-card-semi-circle{
                    flex: 0 0 50%;
                    width: 50%;
                    height: 100%;
                    background-repeat: no-repeat;
                    // 转动到背面 显示状态
                    backface-visibility: hidden;
                }
                .flap-card-semi-circle-left{
                    border-radius: px2rem(24) 0 0 px2rem(24);
                    background-position: center right;
                    transform-origin: right;
                }
                .flap-card-semi-circle-right{
                    border-radius: 0 px2rem(24)  px2rem(24) 0;
                    background-position: center left;
                    transform-origin: left;
                }
            }
        }
        .point-wrapper {
            z-index: 1500;
            @include absCenter;
            .point {
                border-radius: 50%;
                @include absCenter;
                &.animation {
                    @for $i from 1 to length($moves) {
                        &:nth-child(#{$i}) {
                            @include move($i)
                        }
                    }
                }
            }
        }
    }
    .book-card {
    position: absolute;
    width: 65%;
    // height: 70%;
    box-sizing: border-box;
    border-radius: px2rem(15);
    background: white;
    &.animation {
    animation: scale .3s ease-in both;
    @keyframes scale {
        0% {
        transform: scale(0);
        opacity: 0;
        }
        100% {
        transform: scale(1);
        opacity: 1;
        }
    }
    }
    .book-card-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: px2rem(50);
    @include columnTop;
    .img-wrapper {
        width: 100%;
        margin-top: px2rem(20);
        @include center;
        .img {
        width: px2rem(90);
        height: px2rem(130);
        }
    }
    .content-wrapper {
        padding: 0 px2rem(20);
        margin-top: px2rem(20);
        .title {
        color: #333;
        font-weight: bold;
        font-size: px2rem(12);
        line-height: px2rem(20);
        max-height: px2rem(40);
        text-align: center;
        @include ellipsis2(2)
        }
        .author {
        margin-top: px2rem(10);
        text-align: center;
        @include ellipsis2(1);
        }
        .category {
        color: #999;
        font-size: px2rem(14);
        margin-top: px2rem(10);
        text-align: center;
        }
    }
    .read-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1100;
        width: 100%;
        border-radius: 0 0 px2rem(15) px2rem(15);
        padding: px2rem(15) 0;
        text-align: center;
        color: white;
        font-size: px2rem(14);
        background: $color-blue;
    }
    }
    }
}
</style>
