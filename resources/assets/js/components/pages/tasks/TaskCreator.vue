<style>
    .fade-enter-active, .fade-leave-active {
      transition: opacity .5s
    }
    .fade-enter, .fade-leave-active {
      opacity: 0
    }
</style>
<template>
    <nav>
        <div class="nav-wrapper white">
            <form>
                <div class="input-field">
                    <input type="search" placeholder="New task" @click="showMore = true">
                    <i class="material-icons" @click="showMore = false" :style="style">close</i>
                </div>
                <transition name="fade">
                    <div class="more-fields grey lighten-3 z-depth-2" v-show="showMore">
                        <div class="">
                            <form class="col s12">
                                <div class="row">
                                    <div class="col s4">
                                        <p class="center-align">
                                            <input class="with-gap" name="group3" type="radio" id="test5" checked/>
                                            <label for="test5">Low</label>
                                        </p>
                                    </div>
                                    <div class="col s4">
                                        <p class="center-align">
                                            <input class="with-gap" name="group3" type="radio" id="test6"/>
                                            <label for="test6">Medium</label>
                                        </p>
                                    </div>
                                    <div class="col s4">
                                        <p class="center-align">
                                            <input class="with-gap" name="group3" type="radio" id="test7"/>
                                            <label for="test7">High</label>
                                        </p>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12">
                                        <tag-input></tag-input>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12 m6">
                                        <date-picker class="grey-text"></date-picker>
                                    </div>
                                    <div class="col s12 m6">
                                        <date-picker class="grey-text"></date-picker>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12">
                                        <div class="file-field input-field">
                                            <div class="btn">
                                                <span>File</span>
                                                <input type="file">
                                            </div>
                                            <div class="file-path-wrapper">
                                                <input class="file-path validate" type="text">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12">
                                        <button class="btn waves-effect waves-light" type="submit" name="action">Submit
                                            <i class="material-icons right">send</i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div class="clearfix"></div>
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
        computed: {
            style () {
                return {
                    color: this.showMore ? '#757575' : 'transparent'
                }
            }
        }
    }
</script>