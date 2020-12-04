<template>
  <div class="ebook" ref="ebook">
      <ebook-title></ebook-title>
      <ebook-reader></ebook-reader>
      <ebook-menu></ebook-menu>
      <ebook-book-mark></ebook-book-mark>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import EbookReader from '../../components/ebook/EbookReader.vue'
import EbookTitle from '../../components/ebook/EbookTitle.vue'
import EbookMenu from '../../components/ebook/EbookMenu.vue'
import EbookBookMark from '../../components/ebook/EbookBookMark'
import { getReadTime, saveReadTime } from '../../utils/localStorage'
import { ebookMixin } from '../../utils/mixin'
export default {
    mixins: [ebookMixin],
    components: {
        EbookReader,
        EbookTitle,
        EbookMenu,
        EbookBookMark
    },
    watch: {
        offsetY(v) {
            // 菜单栏显示 或 分页未完成时不支持下拉
            if (!this.menuVisible && this.bookAvailable) {
                if (v > 0) {
                this.move(v)
            } else if (v === 0) {
                // 松开手指 设置vuex offsetY 为0 还原页面
                this.restore()
            }
            }
        }
    },
    methods: {
        restore() {
            this.$refs.ebook.style.top = 0
            this.$refs.ebook.style.transition = 'all .3s linear'
            setTimeout(() => { // 动画结束后清除动画 否则每改变一次top值 就会增加一个动画
                this.$refs.ebook.style.transition = ''
            }, 300)
        },
        move(v) {
            this.$refs.ebook.style.top = v + 'px'
        },
        startLoopReadTime() {
            let readTime = getReadTime(this.fileName)
            if (!readTime) {
                readTime = 0
            }
            this.task = setInterval(() => {
                readTime++
                if (readTime % 30 === 0) {
                    saveReadTime(this.fileName, readTime)
                }
            }, 1000)
        }
    },
    mounted() {
        this.startLoopReadTime()
    },
    beforeDestroy() {
        if (this.task) {
            clearInterval(this.task)
        }
    }
}
</script>
<style lang='scss' scoped>
@import "../../assets/styles/global";
.ebook {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}
</style>
