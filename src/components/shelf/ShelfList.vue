<template>
  <div class="shelf-list"  :style="{top: shelfListTop}">
      <transition-group name="list" tag="div" id="shelf-list">
      <div class="shelf-list-item-wrapper" v-for="item in data" :key="item.id">
          <shelf-item :data="item" :style="{height: itemHeight}"></shelf-item>
          <div class="shelf-list-title-wrapper">
              <div class="shelf-list-title title-small">{{item.title}}</div>
          </div>
      </div>
      </transition-group>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import { px2rem, realPx } from '../../utils/utils'
import ShelfItem from './ShelfItem.vue'
// import { getBookShelf } from '../../utils/localStorage'
export default {
    components: { ShelfItem },
    mixins: [storeShelfMixin],
    data() {
        return {
            // shelfListS: getBookShelf() ? getBookShelf() : this.shelfList
        }
    },
    props: {
        top: {
            type: Number,
            default: 94
        },
        data: Array
    },
    computed: {
        itemHeight() {
            return (window.innerWidth - realPx(120)) / 3 / 250 * 350 + 'px'
        },
        shelfListTop() {
            return px2rem(this.top) + 'rem'
        }
    }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.shelf-list {
    position: absolute;
    // top: px2rem(94);
    left: 0;
    z-index: 100;
    width: 100%;
    #shelf-list {
        display: flex;
        flex-flow: row wrap;
        width: 100%;
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .list-leave-active {
            display: none;
        }
        .list-move {
            transition: transform .5s;
        }
        .shelf-list-item-wrapper {
            flex: 0 0 33.3%;
            width: 33.3%;
            padding: px2rem(15);
            box-sizing: border-box;
        }
        .shelf-list-title-wrapper {
            margin-top: px2rem(5);
        }
        }
}
</style>
