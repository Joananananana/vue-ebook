<template>
  <div class="store-home">
      <search-bar></search-bar>
      <flap-card ></flap-card>
      <!-- <flap-card :data="random"></flap-card> -->
      <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">
          <div class="banner-wrapper">
              <img class="banner-img" :src="banner" >
          </div>
          <guess-you-like :data="guessYouLike"></guess-you-like>
          <recommend :data="recommend" class="recommend"></recommend>
          <featured :data="featured" :titleText="$t('home.featured')" :btnText="$t('home.seeAll')" class="featured"></featured>
          <div class="category-list-wrapper" v-for="(item, index) in categoryList" :key="index">
              <category-book :data="item"></category-book>
          </div>
          <category :data="categories" class="categories"></category>
      </scroll>
  </div>
</template>

<script>
import SearchBar from '../../components/home/SearchBar'
import Scroll from '../../components/common/Scroll'
import FlapCard from '../../components/home/FlapCard'
import GuessYouLike from '../../components/home/GuessYouLike'
import Recommend from '../../components/home/Recommend'
import Featured from '../../components/home/Featured'
import CategoryBook from '../../components/home/CategoryBook'
import Category from '../../components/home/Category'
import { storeHomeMixin } from '../../utils/mixin'
import { home } from '../../api/store'
export default {
    mixins: [storeHomeMixin],
    components: {
        SearchBar,
        Scroll,
        FlapCard,
        GuessYouLike,
        Recommend,
        Featured,
        CategoryBook,
        Category
    },
    data() {
        return {
            scrollTop: 94,
            // random: null,
            banner: null,
            guessYouLike: null,
            recommend: null,
            featured: null,
            categoryList: null,
            categories: null
        }
    },
    methods: {
        onScroll(offsetY) {
            this.setOffsetY(offsetY)
            if (offsetY > 0) {
                this.scrollTop = 52
            } else {
                this.scrollTop = 94
            }
            // 重新计算滚动条的高度
            this.$refs.scroll.refresh()
        }
    },
    mounted() {
        home().then(response => {
            if (response && response.status === 200) {
                const data = response.data
                // 随机生成 序号 次序号在0-response.data.random.length 之间 且为整数
                // const randomIndex = Math.floor(Math.random() * data.random.length)
                // this.random = data.random[randomIndex]
                this.banner = data.banner
                this.guessYouLike = data.guessYouLike
                this.recommend = data.recommend
                this.featured = data.featured
                this.categoryList = data.categoryList
                this.categories = data.categories
            }
        })
    }
}
</script>
<style lang='scss' scoped>
@import '../../assets/styles/global';
.store-home{
    width: 100%;
    height: 100%;
    background: white;
    .banner-wrapper {
        width: 100%;
        padding: px2rem(10);
        box-sizing: border-box;
        .banner-img {
            width: 100%;
            height: px2rem(140);
        }
    }
    .recommend {
        // margin-top: px2rem(20);
    }
    .featured {
        // margin-top: px2rme(20);
    }
    .category-list-wrapper {
        // margin-top: px2rem(20);
    }
    .category {
        // margin-top: px2rem(20);
    }
}
</style>
