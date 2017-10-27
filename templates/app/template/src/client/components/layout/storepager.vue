<template lang="pug">
#storepager
    #storepagercard
        #storepagerswap
            Row(type='flex', justify='end')
                Col(span='3')
                    nuxt-link(to='/subscribe')
                        | View page as a buyer
        #storepagercover.bgimg
            #storepagercoverprofile
                #storepagercoverprofilepic.bgimg
                #storepagercoverprofileinfo
                    p#name Openhouse Company Ltd
                    p#category (Distributor/Wholesaler)
            #storepagercoverstats
                p#followers 270 Followers
                p#spacer |
                p#following Following 28
        #storepagernav
            store-menu
</template>

<script lang="livescript">
require! '~/components/layout/storemenu.vue'
module.exports =
  components:
    StoreMenu: storemenu.default
</script>
<style lang="stylus">
.bgimg
    background-size cover !important
    background-position center !important
    background-repeat no-repeat !important
    background-attachment fixed !important
#storepagernav
    border 1px solid #d7dde4
#storepager
    width 80%
    margin 0 auto
#storepagerswap
    margin .5rem auto
#storepagercover
    height 15rem
    background url('https://source.unsplash.com/random')
    display flex
    align-items flex-end
    justify-content flex-start
#storepagercoverstats
    margin-left auto
    display flex
    color #e6e7e8
#storepagercoverstats p
    margin 1rem
#storepagercoverprofile
    display flex
    align-items center
    justify-content center
#storepagercoverprofilepic
    background url('https://source.unsplash.com/random')
    border 1px solid #f5f7f9
    box-shadow 0px 0px 10px #f5f7f9
    margin-left 2rem
    margin-bottom -2rem
    height 10rem
    width 10rem
#storepagercoverprofileinfo
    margin 1rem
    font-size 1rem
    color #e6e7e8
#name
    font-weight bold
#category
    font-size .9rem
    font-style italic
</style>

