<template>
  <div class="store-shelf">
    <shelf-title :title="$t('shelf.title')"></shelf-title>
    <scroll class="store-shelf-scroll-wrapper"  :bottom="scrollBottom" :top="0" ref="scroll" @onScroll="onScroll">
      <shelf-search ></shelf-search>
      <shelf-list :data="shelfList"></shelf-list>
      <shelf-footer></shelf-footer>
    </scroll>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfTitle from '../../components/shelf/ShelfTitle.vue'
import ShelfSearch from '../../components/shelf/ShelfSearch.vue'
import Scroll from '../../components/common/Scroll.vue'
import ShelfList from '../../components/shelf/ShelfList.vue'
import ShelfFooter from '../../components/shelf/ShelfFooter.vue'
export default {
  mixins: [storeShelfMixin],
  watch: {
    isEditMode(isEditMode) {
      this.scrollBottom = isEditMode ? 48 : 0
      // this.$nextTick()将回调延迟到下次 DOM 更新循环之后执行。
      this.$nextTick(() => {
        this.$refs.scroll.refresh()
      })
    }
  },
  data() {
    return {
      scrollBottom: 0
    }
  },
  components: {
    ShelfTitle,
    Scroll,
    ShelfSearch,
    ShelfList,
    ShelfFooter
  },
  methods: {
    // 接收scroll组件的y轴滑动值  存入 vuex 在ShelfTitle.vue 组件中进行监听
    onScroll(offsetY) {
      this.setOffsetY(offsetY)
    }
  },
  mounted() {
    this.getShelfList()
    this.setShelfCategory([])
    this.setCurrentType(1)
  }
}
</script>
    ShelfTitle
<style lang='scss' scoped>
@import '../../assets/styles/global';
.store-shelf {
    width: 100%;
    height: 100%;
    background: white;
    position: relative;
    z-index: 100;
    .store-shelf-scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 101;
    }
}
</style>
