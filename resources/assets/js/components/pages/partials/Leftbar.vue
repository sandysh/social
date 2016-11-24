<style scoped>
    aside {
        position: fixed;
        width: 100px;
        left: 180px;
        z-index: 999;
        height: auto;
    }
</style>
<template>
    <aside>
        <ul class="side-nav fixed" style="transform: translateX(0px);" id="slide-out">
            <li class="bold"><a href="about.html" class="waves-effect waves-teal">All Tasks</a></li>
            <li class="divider"></li>
            <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal">Filters</a></li>
            <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal"><i class="material-icons dp48">add_alert</i>Priority</a></li>
            <li class="bold"><a href="getting-started.html" class="waves-effect waves-teal"><i class="material-icons dp48">perm_contact_calendar</i>Today</a></li>
            <li class="bold"><a href="http://materializecss.com/mobile.html" class="waves-effect waves-teal">Done</a></li>
            <li class="bold"><a href="http://materializecss.com/mobile.html" class="waves-effect waves-teal">Deleted</a></li>
        </ul>
        <a href="#" data-activates="slide-out" class="sidebar-collapse btn-floating btn-medium waves-effect waves-light hide-on-large-only cyan"><i class="mdi-navigation-menu"></i></a>
    </aside>
</template>

<script>
    export default {
        name: 'Leftbar',
        data () {
            return {}
        }
    }
</script>