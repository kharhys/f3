<template lang="pug">
.btn-wrap
  Input(v-model='value13')
      Select(v-model='select3', slot='prepend', style='width: 80px')
        Option(value='day') 日活
        Option(value='month') 月活
      Button(slot='append', icon='ios-search')
</template>

<script lang="livescript">
</script>

<style lang="stylus">
#oms
    color #ffffff
    background #39b54a
    border-color #39b54a
</style>

