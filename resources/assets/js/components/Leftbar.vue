<style>
    .leftbar li>a {
        vertical-align: super;
    }
</style>

<template>
    <div class="col s12 m4 l2 leftbar">
        <ul>
            <li>
                <i class="material-icons">dashboard</i>
                <router-link :to="{name: 'tasks'}">Dashboard</router-link>
            </li>
            <li>
                <i class="material-icons">announcement</i>
                <router-link :to="{name: 'news'}">News Broadcast</router-link>
            </li>
            <li>
                <i class="material-icons">message</i>
                <router-link :to="{name: 'messages'}">Messages</router-link>
            </li>
            <li>
                <i class="material-icons">today</i>
                <router-link :to="{name: 'events'}">Events</router-link>
            </li>
            <li>
                <i class="material-icons">supervisor_account</i>
                <router-link :to="{name: 'teams'}">Teams</router-link>
            </li>
            <li>
                <i class="material-icons">class</i>
                <router-link :to="{name: 'projects'}">Projects</router-link>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: 'Leftbar',
        data () {
            return {}
        }
    }
</script>