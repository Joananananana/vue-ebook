<template>
  <div class="shelf-item-category" >
    <div class="shelf-item-category-list" v-if="data.itemList.length > 0">
      <div class="shelf-item-category-item" v-for="(item, index) in data.itemList" :key="index">
        <img class="shelf-item-category-img" :src="item.cover">
      </div>
    </div>
    <div class="shelf-item0category-bg" v-else>
      <span class="icon-book2"></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object
  }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.shelf-item-category {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .shelf-item-category-list {
    display: flex;
    flex-flow: row wrap;
    // 剩下空间存在空白的时候如何排列
    align-content: flex-start;
    width: 100%;
    height: 100%;
    padding-top: px2rem(5);
    box-sizing: border-box;
    .shelf-item-category-item {
      flex: 0 0 33.3%;
      width: 33.3%;
      height: 33.3%;
      box-sizing: border-box;
      &:nth-child(3n+1) {
        padding: 0 px2rem(2.5) px2rem(5) px2rem(5);
      }
      &:nth-child(3n+2) {
        padding: 0 px2rem(2.5) px2rem(5) px2rem(2.5);
      }
      &:nth-child(3n+3) {
        padding: 0 px2rem(5) px2rem(5) px2rem(2.5);
      }
      .shelf-item-category-img {
        height: 100%;
        width: 100%;
      }
    }
  }
  .shelf-item0category-bg {
    width: 100%;
    height: 100%;
    @include center;
    font-size: px2rem(30);
    color: #ccc;
    background: white;
  }
}
</style>
