<template lang="pug">
#storemenusect
    #compensate
    Menu#storemenu(mode='horizontal', :active-name='$store.state.route.name')
        MenuItem(name='store-orders')
            nuxt-link(to='/store/orders') Orders
        MenuItem(name='store-products')
            nuxt-link(to='/store/products') Products
        MenuItem(name='store-reviews')
            nuxt-link(to='/store/reviews') Reviews
        MenuItem(name='store-settings')
            nuxt-link(to='/store/settings') Settings
        MenuItem(name='store-performance')
            nuxt-link(to='/') Store Performance
        MenuItem(name='store-about')
            nuxt-link(to='/') About
    #messages
        Badge(count='2')
            Icon(type='android-chat')
</template>

<style lang="stylus">
#storemenusect
    display flex
    background #fff
#compensate
    flex 2
#storemenu
    flex 7
    height 50px
#messages
    flex 1
    display flex
    align-items center
    justify-content center
    color #1f5268
#messages i
    font-size 1.5rem
#messages .ivu-badge-count
    background transparent
    font-weight bold
    color #1f5268
    font-size 1rem
    border none
</style>
