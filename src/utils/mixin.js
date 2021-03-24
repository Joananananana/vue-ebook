import {
  mapGetters,
  mapActions
} from 'vuex'
import {
  themeList,
  addCss,
  removeAllCss,
  getReadTimeByMinute
} from './book'
import {
  getBookmark,
  saveLocation,
  getBookShelf,
  saveBookShelf
} from './localStorage'
import {
  shelf
} from '../api/store'
import {
  appendAddToShelf,
  computeId,
  removeAddFromShelf
} from '../utils/store'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark'
    ]),
    themeList() {
      return themeList(this)
    },
    getSectionName() {
      return this.section ? this.navigation[this.section].label : ''
    }
  },
  methods: {
    ...mapActions([
      'setFileName',
      'setMenuVisible',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark'
    ]),
    initGlobalStyle() {
      removeAllCss()
      switch (this.defaultTheme) {
        case 'Default':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
        case 'Eye':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
          break
        case 'Gold':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
          break
        case 'Night':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
          break
        default:
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
      }
    },
    // 切换页面时更新进度 切换章节 换页  切换进度
    refreshLocation() {
      const currentLocation = this.currentBook.rendition.currentLocation()
      if (currentLocation && currentLocation.start) {
        const progress = this.currentBook.locations.percentageFromCfi(currentLocation.start.cfi)
        this.setProgress(Math.floor(progress * 100))
        // 保存阅读进度到localStorage中
        const startCfi = currentLocation.start.cfi
        // 更新vuex section
        this.setSection(currentLocation.start.index)
        saveLocation(this.fileName, startCfi)
        // 判断书签的方法
        const bookmark = getBookmark(this.fileName)
        if (bookmark) {
          // 只要缓存中 存在此 书签  设置vuex isBookmark 为true
          if (bookmark.some(item => item.cfi === startCfi)) {
            this.setIsBookmark(true)
          } else {
            this.setIsBookmark(false)
          }
        } else {
          this.setIsBookmark(false)
        }
      }
    },
    display(target, cb) {
      if (target) {
        this.currentBook.rendition.display(target).then(() => {
          this.refreshLocation()
          if (cb) cb()
        })
      } else {
        this.currentBook.rendition.display().then(() => {
          this.refreshLocation()
          if (cb) cb()
        })
      }
    },
    hideTitleAndMenu() {
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    getReadTimeText() {
      return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
    }
  }
}

export const storeHomeMixin = {
  computed: {
    ...mapGetters([
      'offsetY',
      'hotSearchOffsetY',
      'flapCardVisible'
    ])
  },
  methods: {
    ...mapActions([
      'setOffsetY',
      'setHotSearchOffsetY',
      'setFlapCardVisible'
    ]),
    showBookDetail(book) {
      this.$router.push({
        path: '/store/detail',
        query: {
          fileName: book.fileName,
          category: book.categoryText
        }
      })
    }
  }
}

export const storeShelfMixin = {
  computed: {
    ...mapGetters([
      'isEditMode',
      'shelfList',
      'shelfSelected',
      'shelfTitleVisible',
      'offsetY',
      'shelfCategory',
      'currentType'
    ])
  },
  methods: {
    ...mapActions([
      'setIsEditMode',
      'setShelfList',
      'setShelfSelected',
      'setShelfTitleVisible',
      'setOffsetY',
      'setShelfCategory',
      'setCurrentType'
    ]),
    getShelfList() {
      // 从localStorage 中获取shelf
      let shelfList = getBookShelf()
      if (!shelfList) {
        // console.log(1)
        // localStorage 中没有 shelf 从接口中获取shelf 存入 vuex shelfList 和localStorage
        shelf().then(response => {
          if (response.status === 200 && response.data && response.data.bookList) {
            shelfList = appendAddToShelf(response.data.bookList)
            // 存入localStorage
            saveBookShelf(shelfList)
            // 存入 vuex shelfList
            return this.setShelfList(shelfList)
          }
        })
      } else {
        // localStorage 有 shelf  将其存入 vuex shelfList
        return this.setShelfList(shelfList)
      }
    },
    getCategoryList(title) {
      this.getShelfList().then(() => {
        // filter 将所有满足条件的对象放到一个数组里 因此取第一个[0]
        const categoryList = this.shelfList.filter(book => book.type === 2 && book.title === title)[0]
        // 存入vuex shelfCategory
        this.setShelfCategory(categoryList)
      })
    },
    moveOutOfGroup(f) {
      this.setShelfList(this.shelfList.map(book => {
        if (book.type === 2 && book.itemList) {
          // 保留没有被选中的图书
          book.itemList = book.itemList.filter(subBook => !subBook.selected)
        }
        return book
      }))
      // .then(() => {
      // 将书架最后添加图书的那个对象删除
      // const list = removeAddFromShelf(this.shelfList)
      // 选中的电子书 添加到书架最后
      // list = [].concat(list, ...this.shelfSelected)
      // 将添加图书的那个对象添加到书架上
      // list = appendAddToShelf(list)
      // 重新计算id
      // list = computeId(list)
      const list = computeId(appendAddToShelf([].concat(removeAddFromShelf(this.shelfList), ...this.shelfSelected)))
      this.setShelfList(list).then(() => {
        this.simpleToast(this.$t('shelf.moveBookOutSuccess'))
        // this.onComplete()
        if (f) f()
      })
      // })
    },
    addToShelf(book) {
      this.setShelfSelected([book])
      // .then(() => {
      // 将书架最后添加图书的那个对象删除
      // const list = removeAddFromShelf(this.shelfList)
      // 选中的电子书 添加到书架最后
      // list = [].concat(list, ...this.shelfSelected)
      // 将添加图书的那个对象添加到书架上
      // list = appendAddToShelf(list)
      // 重新计算id
      // list = computeId(list)
      const list = computeId(appendAddToShelf([].concat(removeAddFromShelf(getBookShelf()), ...this.shelfSelected)))
      this.setShelfList(list).then(() => {
        saveBookShelf(list)
        this.setShelfSelected([])
        this.simpleToast(this.$t('detail.addedToShelf'))
      })
      // })
    },
    removeFromShelf(bookItem) {
      this.setShelfList(this.shelfList.filter(book => {
        // 检查这本书是否在书架目录中
        if (book.itemList) {
          book.itemList = book.itemList.filter(subitems => subitems.fileName !== bookItem.fileName)
        }
        // 检查这本书是否在书架中
        return book.fileName !== bookItem.fileName
      })).then(() => {
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('detail.removeFromShelf'))
      })
    }
  }
}
