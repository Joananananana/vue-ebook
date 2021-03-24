<template>
  <transition name="fade">
  <div class="shelf-title" :class="{'hide-shadow': ifHideShadow}" v-show="shelfTitleVisible">
      <div class="shelf-title-text-wrapper">
          <span class="shelf-title-text"> {{title}}</span>
          <span class="shelt-title-sub-text" v-show="isEditMode">{{selectedText}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showClear">
          <span class="shelf-title-btn-text" @click="clearCache">{{$t('shelf.clearCache')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-right" v-if="showEdit">
          <span class="shelf-title-btn-text" @click="onEditClick">{{isEditMode ? $t('shelf.cancel') : $t('shelf.edit')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showBack">
          <span class="icon-back" @click="back"></span>
      </div>
      <div class="shelf-title-btn-wrapper" :class="{'shelf-title-left': changeGroupLeft, 'shelf-title-right': changeGroupRight}" @click="changeGroup" v-if="showChangeGroup">
          <span class="shelf-title-btn-text">{{$t('shelf.editGroup')}}</span>
      </div>
  </div>
  </transition>
</template>

<script>
// vuex
// isEditMode  是否进入编辑模式
// shelfList  书架图书列表
//  shelfSelected  书架图书选中的列表
//  shelfTitleVisible 书架标题的显示状态
import { storeShelfMixin } from '../../utils/mixin'
import { clearLocalStorage, saveBookShelf } from '../../utils/localStorage'
import { clearLocalForage } from '../../utils/localForage'
export default {
    mixins: [storeShelfMixin],
    computed: {
        // 判断当前目录是否为空
        emptyCategory() {
            return !this.shelfCategory || !this.shelfCategory.itemList || this.shelfCategory.itemList.length === 0
        },
        // 显示编辑按钮的条件  书架下  或  目录为空
        showEdit() {
            return this.currentType === 1 || !this.emptyCategory
        },
        // 显示清除缓存按钮的条件 书架下
        showClear() {
            // return this.currentType === 1
            return this.currentType === 1 && this.isEditMode
        },
        // 显示返回按钮的条件 ： 目录下 非编辑状态
        showBack() {
            // return this.currentType === 2 && !this.isEditMode
            return (this.currentType === 2 && !this.isEditMode) || !this.isEditMode
        },
        // 显示修改分组的条件： 目录下 编辑模式 / 空目录 非编辑模式
        showChangeGroup() {
            return this.currentType === 2 && (this.isEditMode || this.emptyCategory)
        },
        changeGroupLeft() {
            return !this.emptyCategory
        },
        changeGroupRight() {
            return this.emptyCategory
        },
        // 选择书籍/ 已选择n本书
        selectedText() {
            const selectedNumber = this.shelfSelected ? this.shelfSelected.length : 0
            return selectedNumber <= 0 ? this.$t('shelf.selectBook') : (selectedNumber === 1 ? this.$t('shelf.haveSelectedBook').replace('$1', selectedNumber) : this.$t('shelf.haveSelectedBooks').replace('$1', selectedNumber))
        },
        popupCancelBtn() {
            return this.createPopupBtn(this.$t('shelf.cancel'), () => {
                        this.hidePopup()
                    })
        }
    },
    watch: {
        // 监听scroll 滑动 控制阴影的显示
        offsetY(offsetY) {
            if (offsetY > 0) {
                this.ifHideShadow = false
            } else {
                this.ifHideShadow = true
            }
        }
    },
    data() {
        return {
            ifHideShadow: true
        }
    },
    props: {
        title: String
    },
    methods: {
        hidePopup() {
            this.popupMenu.hide()
        },
        createPopupBtn(text, onClick, type = 'normal') {
            return {
                text: text,
                type,
                click: onClick
            }
        },
        changeGroupName() {
            this.hidePopup()
            this.dialog({
                showNewGroup: true,
                groupName: this.shelfCategory.title
            }).show()
        },
        onComplete() {
            this.hidePopup()
            this.setShelfList(this.shelfList.filter(book => book.id !== this.shelfCategory.id)).then(() => {
                saveBookShelf(this.shelfList)
                this.$router.go(-1)
                this.setIsEditMode(false)
            })
        },
        deleteGroup() {
            // 将分组下所有图书还原到书架  删除分组
            // 如果目录下 书籍不为空 选中所有书籍 执行移出图书的操作
            if (!this.emptyCategory) {
                this.setShelfSelected(this.shelfCategory.itemList)
                this.moveOutOfGroup(this.onComplete)
            } else {
                this.onComplete()
            }
        },
        showDeleteGroup() {
            this.hidePopup()
            // hidepopup有一个.2s的过渡动画
            setTimeout(() => {
                this.popupMenu = this.popup({
                title: this.$t('shelf.deleteGroupTitle'),
                btn: [
                    this.createPopupBtn(this.$t('shelf.confirm'), () => {
                        this.deleteGroup()
                    }, 'danger'),
                    this.popupCancelBtn
                ]
            }).show()
            }, 300)
        },
        changeGroup() {
            this.popupMenu = this.popup({
                btn: [
                    this.createPopupBtn(this.$t('shelf.editGroupName'), () => {
                        this.changeGroupName()
                    }),
                    this.createPopupBtn(this.$t('shelf.deleteGroup'), () => {
                        this.showDeleteGroup()
                    }, 'danger'),
                    this.popupCancelBtn
                ]
            }).show()
        },
        back() {
            this.$router.go(-1)
            this.setIsEditMode(false)
        },
        onEditClick() {
            if (this.isEditMode) {
                // 点击取消 清空vuex shelfSelected
                this.setShelfSelected([])
                // 书架所有图书选中状态变为为false
                this.shelfList.forEach(item => {
                    item.selected = false
                    // 将目录下 所有书籍的selected也置为false
                    if (item.itemList) {
                        item.itemList.forEach(subItem => {
                            subItem.selected = false
                        })
                    }
                })
                // saveBookShelf(this.shelfList)
            }
            this.setIsEditMode(!this.isEditMode)
        },
        clearCache() {
            // 清空localStorage localForage
            clearLocalStorage()
            clearLocalForage()
            // 清空 vuex shelfList shelfSelected
            this.setShelfList([])
            this.setShelfSelected([])
            // 书架页面重新获取数据
            this.getShelfList()
            this.simpleToast(this.$t('shelf.clearCacheSuccess'))
        }
    }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.shelf-title {
    z-index: 110;
    position: relative;
    width: 100%;
    height: px2rem(42);
    background: white;
    box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, 0.1);
    &.hide-shadow {
        box-shadow: none;
    }
    .shelf-title-text-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: px2rem(42);
        @include columnCenter;
        .shelf-title-text {
            font-size: px2rem(16);
            line-height: px2rem(20);
            font-weight: bold;
            color: #333;
        }
        .shelt-title-sub-text {
            font-size: px2rem(10);
            color: #333;
        }
    }
    .shelf-title-btn-wrapper {
        position: absolute;
        top: 0;
        box-sizing: border-box;
        height: 100%;
        @include center;
        .shelf-title-btn-text {
            font-size: px2rem(14);
            color: #666;
        }
        .icon-back {
            font-size: px2rem(20);
            color: #666;
        }
        &.shelf-title-left {
            left: 0;
            padding-left: px2rem(15);
        }
        &.shelf-title-right {
            right: 0;
            padding-right: px2rem(15);
        }
    }
}
</style>
