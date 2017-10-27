<template lang="pug">
Menu#storeheader-menu(mode='horizontal', theme='dark', active-name='1')
  Row.code-row-bg(type='flex', justify='center', align='middle')
    Col(span='3')
      nuxt-link#storeheader-logo(to='/')
    Col(span='7', offset='1')
      Input(v-model='querystring')
        Select(v-model='queryscope', slot='prepend', style='width: 80px')
          Option(value='all') All
          Option(value='of') Of
          Option(value='me') Me
        Button(slot='append', type='success', icon='ios-search')
    Col(span='1')
      span.white(style='display: inline-block; padding-left: .5rem; font-size: .7rem;') Advanced
    Col(span='3')
      Dropdown
        a(href='javascript:void(0)')
          span.white(style='display: inline-block; padding-right: .5rem') My Tendapa
          icon.white(type='arrow-down-b')
        DropdownMenu(slot='list')
          DropdownItem
            nuxt-link(to='/store') My Store
          DropdownItem
            | our tendapa
    Col(span='1')
      Icon.white(type='ios-bell')
    Col(span='1')
      Icon.white(type='ios-cart')
    Col(span='3')
      Dropdown
        a(href='javascript:void(0)')
          span.white(style='display: inline-block; padding-right: .5rem') Sell
          icon.white(type='arrow-down-b')
        DropdownMenu(slot='list')
          DropdownItem
            nuxt-link(to='/openstore', style='display: inline-block; padding-right: .5rem') Open Store
          DropdownItem
            nuxt-link(to='/openstore', style='display: inline-block; padding-right: .5rem') Add Product
    Col(span='2')
      Dropdown
        a(href='javascript:void(0)')
          span.white(style='display: inline-block; padding-right: .5rem') Community
          icon.white(type='arrow-down-b')
        DropdownMenu(slot='list')
          DropdownItem
            | fellows
          DropdownItem
            | networks
    Col(span='2')
      Dropdown
        a(href='javascript:void(0)')
          span.white(style='display: inline-block; padding-right: .5rem') Help
          icon.white(type='arrow-down-b')
        DropdownMenu(slot='list')
          DropdownItem
            | SOS
</template>

<script lang="livescript">
require! '~/components/layout/openstore.vue'
module.exports =
  data: ->
    querystring: ''
    queryscope: 'all'
  components:
    OpenStore: openstore.default
</script>

<style scoped lang="stylus">
.ivu-input-group-append
    border-radius 15%
.ivu-input-group-prepend
    border-radius 12%
.ivu-col
    text-align center
#hiw
    border none
    border-radius 0
    padding-right 1rem
    border-right 1px solid #ffffff
#storeheader-menu
    background #1f5268
#storeheader-menu .white,
#storeheader-menu icon
    color #fff
#storeheader-menu .ivu-col
    font-size 0.8rem !important
    font-weight bold
#header-nav
    float right
    margin-right 1rem
#header-nav > li
    float right
#header-nav > li > button
    color #ffffff
#storeheader-logo
    top 0
    left 2rem
    float left
    width 10rem
    height 2.5rem
    position relative
    background-repeat no-repeat !important
    background url('~assets/img/tendapa_logo_white.svg')
.ivu-menu-horizontal .ivu-menu-item,
.ivu-menu-horizontal .ivu-menu-submenu
    padding 0 .5rem
</style>

