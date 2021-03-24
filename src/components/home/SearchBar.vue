<template>
  <div>
  <div class="search-bar" :class="{'hide-title': !titleVisible, 'hide-shadow': !shadowVisible}">
    <transition name="title-move">
      <div class="search-bar-title-wrapper" v-show="titleVisible">
        <div class="title-text-wrapper">
            <span class="title-text title">{{$t('home.title')}}</span>
        </div>
        <div class="title-icon-shake-wrapper" @click="showFlapCard">
            <span class="icon-shake icon"></span>
        </div>
      </div>
    </transition>
      <div class="title-icon-back-wrapper" :class="{'hide-title': !titleVisible}" @click="back">
        <span class="icon-back icon"></span>
      </div>
      <div class="search-bar-input-wrapper" :class="{'hide-title': !titleVisible}">
        <div class="search-bar-blank" :class="{'hide-title': !titleVisible}"></div>
        <div class="search-bar-input">
          <span class="icon-search icon"></span>
          <input type="text" class="input" :placeholder="$t('home.hint')"
          v-model="searchText"
          @click="showHotSearch"
          @keyup.13.exact="search">
        </div>
      </div>
  </div>
  <hot-search-list v-show="hotSearchVisible" ref="hotSearch"></hot-search-list>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import HotSearchList from './HotSearchList.vue'
export default {
  components: { HotSearchList },
  data() {
    return {
      searchText: '',
      titleVisible: true,
      shadowVisible: false,
      hotSearchVisible: false
    }
  },
  mixins: [storeHomeMixin],
  watch: {
    offsetY(offsetY) {
      if (offsetY > 0) {
        this.hideTitle()
        this.showShadow()
      } else {
        this.showTitle()
        this.hideShadow()
      }
    },
    hotSearchOffsetY(offsetY) {
      if (offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
    }
  },
  methods: {
    search() {
      this.$router.push({
        path: '/store/list',
        query: {
          keyword: this.searchText
        }
      })
    },
    showFlapCard() {
      this.setFlapCardVisible(true)
    },
    back() {
      if (this.offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
      // 如果当前在首页 点击返回箭头 将进入书架
      if (this.hotSearchVisible) {
        this.hideHotSearch()
      } else {
        this.$router.push('/store/shelf')
      }
    },
    hideHotSearch() {
      // 隐藏热门搜索 回到首页时  判断首页滚动条的位移  位移为0 显示标题 隐藏阴影 位移不为0 隐藏标题 显示阴影
      this.hotSearchVisible = false
      if (this.offsetY > 0) {
        this.showShadow()
        this.hideTitle()
      } else {
        this.hideShadow()
        this.showTitle()
      }
    },
    showHotSearch() {
      this.hideTitle()
      this.hideShadow()
      this.hotSearchVisible = true
      // 每次打开热门搜索 重置热门搜索滚动条位置
      // this.$nextTick()将回调延迟到下次 DOM 更新循环之后执行。
      this.$nextTick(() => {
        this.$refs.hotSearch.reset()
      })
    },
    hideTitle() {
      this.titleVisible = false
    },
    showTitle() {
      this.titleVisible = true
    },
    hideShadow() {
      this.shadowVisible = false
    },
    showShadow() {
      this.shadowVisible = true
    }
  }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.search-bar{
  z-index: 150;
  position: relative;
  width: 100%;
  height: px2rem(94);
  box-shadow: 0 px2rem(2) px2rem(2) rgba(0, 0, 0, .1);
  &.hide-title {
    height: px2rem(52);
  }
  &.hide-shadow {
    box-shadow: none;
  }
  .search-bar-title-wrapper{
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    height: px2rem(42);
    .title-text-wrapper{
      width: 100%;
      height: px2rem(42);
      @include center;
    }
    .title-icon-shake-wrapper{
      position: absolute;
      right: px2rem(15);
      top: 0;
      height: px2rem(42);
      @include center;
    }
  }
  .title-icon-back-wrapper{
      z-index: 200;
      position: absolute;
      left: px2rem(15);
      top: 0;
      height: px2rem(42);
      @include center;
      transition: height $animationTime $animationType;
      &.hide-title {
        height: px2rem(52);
      }
    }
  .search-bar-input-wrapper{
    width: 100%;
    height: px2rem(52);
    padding: px2rem(10);
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: px2rem(42);
    transition: top $animationTime $animationType;
    display: flex;
    &.hide-title{
        top: 0;
      }
    .search-bar-blank {
      flex: 0 0 0;
      width: 0;
      transition: all $animationTime $animationType;
      &.hide-title {
        flex: 0 0 px2rem(31);
        width: px2rem(31);
      }
    }
    .search-bar-input{
      flex: 1;
      width: 100%;
      background: #f4f4f4;
      border-radius: px2rem(20);
      padding: px2rem(5) px2rem(15);
      box-sizing: border-box;
      border: px2rem(1) solid #eee;
      @include left;
      .icon-search {
        color: #999;
      }
      .input{
        width: 100%;
        height: px2rem(22);
        border: none;
        background: transparent;
        margin-left: px2rem(12);
        font-size: px2rem(12);
        color: #666;
        &:focus {
          outline: none;
        }
        &:-webkit-input-placeholder {
          color: #666;
        }
      }
    }
  }
}
</style>
