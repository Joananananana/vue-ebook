<template>
  <div id="app" class="book-mark-background">
    <router-view />
  </div>
</template>
<script>
export default {
}
document.addEventListener('DOMContentLoaded', () => {
  const html = document.querySelector('html')
  var fontSize = window.innerWidth / 10
  fontSize = fontSize > 50 ? 50 : fontSize
  html.style.fontSize = fontSize + 'px'
})
</script>
<style lang="scss" scoped>
@import './assets/styles/global.scss';
#app{
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #5d6268;
}
</style>
