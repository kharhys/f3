<template lang="pug">
#indexpage
    Hero
    Pitch
    Guide
    Features
</template>

<script lang="livescript">
require! '~/components/index/hero.vue' 
require! '~/components/index/pitch.vue' 
require! '~/components/index/guide.vue' 
require! '~/components/index/features.vue' 
module.exports = 
  components:
    Hero: hero.default 
    Pitch: pitch.default 
    Guide: guide.default 
    Features: features.default 
</script>

<style lang='stylus'>
#indexpage
    border 2px solid #fff
    width 100%
</style>
