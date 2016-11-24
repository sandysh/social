<style>
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
      opacity: 0
    }
    .slide-fade-enter-active {
      transition: all .3s ease;
    }
    .slide-fade-leave-active {
      transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
    }
    .slide-fade-enter, .slide-fade-leave-active {
      padding-left: 10px;
      opacity: 0;
    }
</style>
<template>
    <nav>
        <div class="nav-wrapper white">
            <form>
                <div class="input-field">
                    <input type="search" placeholder="New task" @click="showMore = true" @blur="showMore = false">
                    <i class="material-icons">close</i>
                </div>
                <transition name="fade">
                    <div class="more-fields" v-show="showMore">
                        <div style="height:100px" class="green"></div>
                    </div>
                </transition>
            </form>
        </div>
    </nav>
</template>

<script>
    export default {
        name: 'TaskCreator',
        data () {
            return {
                showMore: false
            }
        },
        methods: {
            
        }
    }
</script>