<template>
  <div class="shelf-item" :class="{'shelf-item-shadow': data.type === 1 || data.type === 2}" @click="onItemClick">
    <component class="shelf-item-comp" :is="item"
    :data="data"
    :class="{'is-edit': data.type === 2 && isEditMode}"
    ></component>
    <div class="icon-selected" :class="{'is-selected': data.selected}" v-show="isEditMode && data.type === 1"></div>
  </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfBook from './ShelfItemBook'
import ShelfCategory from './ShelfItemCategory'
import ShelfAdd from './ShelfItemAdd'
import { gotoStoreHome, gotoBookDetail } from '../../utils/store'
export default {
  data() {
    return {
      book: ShelfBook,
      category: ShelfCategory,
      add: ShelfAdd
    }
  },
  mixins: [storeShelfMixin],
  props: {
    data: Object
  },
  computed: {
    item() {
      return this.data.type === 1 ? this.book : (this.data.type === 2 ? this.category : this.add)
    }
  },
  methods: {
    onItemClick() {
      // 编辑模式
      if (this.isEditMode) {
        // 编辑模式下只能选中书 不能选择目录
        if (this.data.type !== 1) {
          return
        }
        // 点击改变选中状态
        this.data.selected = !this.data.selected
        if (this.data.selected) { // 选中 添加到vuex shelfSelected
          this.shelfSelected.pushWithoutDuplicate(this.data)
        } else {
          // 取消选中 从vuex shelfSelected中删除
          this.setShelfSelected(this.shelfSelected.filter(item => item.id !== this.data.id))
        }
      } else { // 非编辑模式
          if (this.data.type === 1) {
            // 跳转详情页
            gotoBookDetail(this, this.data)
        } else if (this.data.type === 2) {
          // 点击的是目录
          this.$router.push({
            path: '/store/category',
            query: {
              title: this.data.title
            }
          })
        } else {
          // 跳转首页
          gotoStoreHome(this)
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.shelf-item {
  position: relative;
  width: 100%;
  height: 100%;
  &.shelf-item-shadow {
    box-shadow: px2rem(2) px2rem(2) px2rem(6) px2rem(2) rgba(200, 200, 200, .3);
  }
  .shelf-item-comp {
    opacity: 1;
    &.is-edit {
      opacity: 0.5;
    }
  }
  .icon-selected {
    position: absolute;
    bottom: px2rem(2);
    right: px2rem(2);
    font-size: px2rem(18);
    color: rgba(0, 0, 0, .4);
    &.is-selected {
      color: $color-blue;
    }
  }
}
</style>
