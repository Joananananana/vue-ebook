<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div
      class="shelf-footer-tab-wrapper"
      v-for="item in tab"
      :key="item.index"
      @click="onTabClick(item)"
    >
      <div class="shelf-footer-tab" :class="{ 'is-selected': isSelected }">
        <div
          class="icon-private tab-icon"
          v-if="item.index === 1 && !isPrivate"
        ></div>
        <div
          class="icon-private-see tab-icon"
          v-if="item.index === 1 && isPrivate"
        ></div>
        <div
          class="icon-download tab-icon"
          v-if="item.index === 2 && !isDownload"
        ></div>
        <div
          class="icon-download-remove tab-icon"
          v-if="item.index === 2 && isDownload"
        ></div>
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <div class="tab-text" :class="{ 'remove-text': item.index === 4 }">
          {{ label(item) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from "../../utils/mixin";
import { removeLocalStorage, saveBookShelf } from "../../utils/localStorage";
import { download } from "../../api/store";
import { removeLocalForage } from "../../utils/localForage";
export default {
  mixins: [storeShelfMixin],
  computed: {
    // 四个菜单
    tab() {
      return [
        {
          label: this.$t("shelf.private"),
          label2: this.$t("shelf.noPrivate"),
          index: 1,
        },
        {
          label: this.$t("shelf.download"),
          label2: this.$t("shelf.delete"),
          index: 2,
        },
        {
          label: this.$t("shelf.move"),
          index: 3,
        },
        {
          label: this.$t("shelf.remove"),
          index: 4,
        },
      ];
    },
    // 判断是否有图书被选中
    isSelected() {
      return this.shelfSelected && this.shelfSelected.length > 0;
    },
    // 判断选中的图书是否是私密阅读 选中的每一本书都是私密阅读 才会显示取消私密阅读
    isPrivate() {
      if (!this.isSelected) {
        return false;
      } else {
        return this.shelfSelected.every((item) => item.private);
      }
    },
    // 判断选中的图书是否缓存 选中的每一本书 cache 为 true 才会显示删除
    isDownload() {
      if (!this.isSelected) {
        return false;
      } else {
        return this.shelfSelected.every((item) => item.cache);
      }
    },
  },
  data() {
    return {
      popupMenu: null,
    };
  },
  watch: {
    isEditMode(isEditMode) {
      if (!isEditMode) {
        // 清空vuex shelfSelected
        this.setShelfSelected([]);
        // 书架所有图书选中状态变为为false
        this.shelfList.forEach((item) => {
          item.selected = false;
          // 将目录下 所有书籍的selected也置为false
          if (item.itemList) {
            item.itemList.forEach((subItem) => {
              subItem.selected = false;
            });
          }
        });
        //  修改缓存
        saveBookShelf(this.shelfList);
      }
    },
  },
  methods: {
    // 菜单标题
    label(item) {
      switch (item.index) {
        case 1:
          return this.isPrivate ? item.label2 : item.label;
        case 2:
          return this.isDownload ? item.label2 : item.label;
        default:
          return item.label;
      }
    },
    hidePopup() {
      this.popupMenu.hide();
    },
    // 循环下载选中的书籍
    async downloadSelectedBook() {
      const promises = this.shelfSelected.map(async (book) => {
        await this.downloadBook(book).then((book) => {
          book.cache = true;
        });
      });
      await Promise.all(promises);
      // for (let i = 0; i < this.setShelfSelected.length; i++) {
      //     this.downloadBook(this.setShelfSelected[i])
      //     .then(book => {
      //         book.cache = true
      //     })
      // }
    },
    downloadBook(book) {
      let text = "";
      let toast = this.toast({
        text,
      });
      toast.continueShow();
      return new Promise((resolve, reject) => {
        download(
          book,
          (res) => {
            toast.remove();
            resolve(book);
          },
          reject,
          (ProgressEvent) => {
            const progress =
              Math.floor((ProgressEvent.loaded / ProgressEvent.total) * 100) +
              "%)";
            // console.log(progress)
            const text = this.$t("shelf.progressDownload").replace(
              "$1",
              `${book.fileName}.epub(${progress}`
            );
            toast.updateText(text);
          }
        );
      });
    },
    //   删除缓存的书籍 调用removeBook(book) 删除缓存 并设置 cache 为false
    removeSelectedBook() {
      //   promise.all 接收所有的返回值 book =>books
      Promise.all(this.shelfSelected.map((book) => this.removeBook(book))).then(
        (books) => {
          books.map((book) => {
            book.cache = false;
          });
          saveBookShelf(this.shelfList);
          this.simpleToast(this.$t("shelf.removeDownloadSuccess"));
        }
      );
    },
    //   删除书籍在LocalStorage和LocalForage中的缓存
    removeBook(book) {
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`);
        removeLocalForage(`${book.fileName}`, resolve, reject);
        resolve(book);
      });
    },
    onComplete() {
      // 清除弹框
      this.hidePopup();
      // 退出编辑状态
      this.setIsEditMode(false);
      // 书架中的图书存入localStorage
      saveBookShelf(this.shelfList);
    },
    // 设置私密状态 计算属性isPrivate 为 ture 则设置选中书籍私密状态为false  计算属性isPrivate 为 false 则设置选中书籍私密状态为true
    setPrivate() {
      let isPrivate;
      // 计算属性isPrivate
      if (this.isPrivate) {
        isPrivate = false;
      } else {
        isPrivate = true;
      }
      // 用 isPrivate的值覆盖 vuex shelfSelected 每一个对象的private属性值
      this.shelfSelected.forEach((book) => {
        book.private = isPrivate;
      });
      this.onComplete();
      if (isPrivate) {
        this.simpleToast(this.$t("shelf.setPrivateSuccess"));
      } else {
        this.simpleToast(this.$t("shelf.closePrivateSuccess"));
      }
    },
    // 下载/删除书籍 计算属性isDownload 为 ture 则设置选中书籍cache为false  计算属性isDownload 为 false 则设置选中书籍cache为false
    async setDownload() {
      this.onComplete();
      if (this.isDownload) {
        this.removeSelectedBook();
      } else {
        await this.downloadSelectedBook();
        saveBookShelf(this.shelfList);
        this.simpleToast(this.$t("shelf.setDownloadSuccess"));
      }
    },
    // 移出书架
    removeSelected() {
      this.shelfSelected.forEach((selected) => {
        // 保留未选中的书籍
        this.setShelfList(this.shelfList.filter((book) => book !== selected));
        // 清空选中项
        this.setShelfSelected([]);
        this.onComplete();
      });
    },
    // 点击私密阅读/取消私密阅读触发的事件
    showPrivate() {
      this.popupMenu = this.popup({
        title: this.isPrivate
          ? this.$t("shelf.closePrivateTitle")
          : this.$t("shelf.setPrivateTitle"),
        btn: [
          {
            text: this.isPrivate
              ? this.$t("shelf.close")
              : this.$t("shelf.open"),
            click: () => {
              this.setPrivate();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
    // 点击开启离线/删除 触发的事件
    showDownload() {
      this.popupMenu = this.popup({
        title: this.isDownload
          ? this.$t("shelf.removeDownloadTitle")
          : this.$t("shelf.setDownloadTitle"),
        btn: [
          {
            text: this.isDownload
              ? this.$t("shelf.delete")
              : this.$t("shelf.open"),
            click: () => {
              this.setDownload();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
    // 点击移出书架触发的事件
    showRemove() {
      let title;
      if (this.shelfSelected.length === 1) {
        title = this.$t("shelf.removeBookTitle").replace(
          "$1",
          `《${this.shelfSelected[0].title}》`
        );
      } else {
        title = this.$t("shelf.removeBookTitle").replace(
          "$1",
          this.$t("shelf.selectedBooks")
        );
      }
      this.popupMenu = this.popup({
        title: title,
        btn: [
          {
            text: this.$t("shelf.removeBook"),
            type: "danger",
            click: () => {
              this.removeSelected();
            },
          },
          {
            text: this.$t("shelf.cancel"),
            click: () => {
              this.hidePopup();
            },
          },
        ],
      }).show();
    },
    // 菜单点击事件
    onTabClick(item) {
      if (!this.isSelected) {
        return;
      }
      switch (item.index) {
        case 1:
          this.showPrivate();
          break;
        case 2:
          this.showDownload();
          break;
        case 3:
          this.dialog().show();
          break;
        case 4:
          this.showRemove();
          break;
        default:
          break;
      }
    },
  },
};
</script>
<style lang='scss' scoped>
@import "../../assets/styles/global";
.shelf-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-2) ox2rem(4) 0 rgba(0, 0, 0, 0.1);
  .shelf-footer-tab-wrapper {
    flex: 1;
    width: 25%;
    height: 100%;
    .shelf-footer-tab {
      width: 100%;
      height: 100%;
      @include columnCenter;
      opacity: 0.5;
      &.is-selected {
        opacity: 1;
      }
      .tab-icon {
        font-size: px2rem(20);
        color: #666;
      }
      .tab-text {
        margin-top: px2rem(5);
        font-size: px2rem(12);
        color: #666;
        &.remove-text {
          color: $color-pink;
        }
      }
      .icon-shelf {
        color: $color-pink;
      }
    }
  }
}
</style>
