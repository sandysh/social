<style>
    #main {
        padding-left: 240px;
    }
    @media only screen and (min-width: 993px) {
        .container {
            width: 98%;
        }
    }

    @media only screen and (min-width: 601px) {
        .container {
            width: 98%;
        }
    }

    .container {
        margin: 0 auto;
        max-width: 100% !important;
        width: 98%;
    }
</style>
<template>
    <div v-if="(companies.length || settings.skip) && $auth.ready()">
        <navbar></navbar>

        <div id="main">
            <div class="wrapper">
                <leftbar></leftbar>
                <section id="content">
                    <div class="container">
                        <router-view></router-view>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <company-creator v-else></company-creator>
</template>

<script>
    import Navbar from './partials/Navbar.vue';
    import Leftbar from './partials/Leftbar.vue';
    // import Rightbar from './Rightbar.vue';
    import CompanyCreator from '../sub-components/CompanyCreator.vue';
    import { mapGetters } from 'vuex';

    export default {
        name: "Dashboard",
        data () {
            return {
                settings: {},
                tasks: []
            }
        },
        computed: {
            companies () {
                return this.$auth.user().companies;
            }
        },
        mounted () {
            let settings = localStorage.getItem('settings');
            
            if (!settings) {
                settings = {
                    company: {
                        skip: false
                    }
                };
            }else {
                settings = JSON.parse(settings);
            } 

            console.log(settings);

            this.settings = settings;

            settings = JSON.stringify(settings);

            localStorage.setItem('settings', settings);
        },
        components: {Navbar, Leftbar, /*Rightbar, */CompanyCreator}
    }
</script>