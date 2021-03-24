<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title" ></shelf-title>
    <scroll class="store-shelf-scroll-wrapper"  :bottom="scrollBottom" :top="0" ref="scroll" @onScroll="onScroll" v-if="ifShowList">
      <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
      <shelf-footer></shelf-footer>
    </scroll>
    <div class="store-shelf-empty-view" v-else>
      {{$t('shelf.groupNone')}}
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfTitle from '../../components/shelf/ShelfTitle.vue'
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
        if (this.$refs.scroll) {
          this.$refs.scroll.refresh()
        }
      })
    }
  },
  data() {
    return {
      scrollBottom: 0
    }
  },
  computed: {
    ifShowList() {
      return this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
    }
  },
  components: {
    ShelfTitle,
    Scroll,
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
    this.getCategoryList(this.$route.query.title)
    this.setCurrentType(2)
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
    .store-shelf-empty-view {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      font-size: px2rem(14);
      @include center;
    }
}
</style>
